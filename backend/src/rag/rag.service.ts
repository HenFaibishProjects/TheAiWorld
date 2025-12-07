import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { RagResponse } from './rag-response';
import OpenAI from 'openai';

@Injectable()
export class RagService {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private assistantId: string | null = null;
  private readonly logger = new Logger(RagService.name);
  private client: OpenAI;
  private vectorStoreId: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.vectorStoreId =
      process.env.OPENAI_VECTOR_STORE_ID ||
      'vs_6920ab0ec2f48191aa82cd3b209fb636'; // fallback
  }

  // ==========================
  // PUBLIC METHOD
  // ==========================
  async ask(query: string): Promise<RagResponse> {
    // Create assistant if needed
    if (!this.assistantId) {
      this.assistantId = await this.createAssistant();
    }

    // Create thread
    const threadId = await this.createThread();

    // Add user message
    await this.addMessage(threadId, query);

    // Run the assistant
    const runId = await this.runAssistant(threadId);

    // Wait for response
    const rawOutput = await this.waitForRun(threadId, runId);

    // Parse JSON safely
    return this.parseJsonOutput(rawOutput);
  }

  // ==========================
  // INTERNAL HELPERS
  // ==========================

  private parseJsonOutput(text: string): RagResponse {
    try {
      const parsed = JSON.parse(text) as {
        answer?: string;
        fromData?: boolean;
        fromAI?: boolean;
        tokens?: number;
      };

      return {
        answer: parsed.answer ?? text,
        fromData: Boolean(parsed.fromData),
        fromAI: Boolean(parsed.fromAI),
        tokens: Number(parsed.tokens ?? 0),
      };
    } catch {
      // fallback – model didn't output valid JSON
      return {
        answer: text,
        fromData: false,
        fromAI: true,
        tokens: 0,
      };
    }
  }

  // ==========================
  // OPENAI REST CALLS
  // ==========================

  private async createAssistant(): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/assistants', {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify({
        name: 'RAG Assistant',
        model: 'gpt-4o-mini',
        instructions: `
You MUST respond ONLY in this JSON format:
{
  "answer": "...",
  "fromData": true/false,
  "fromAI": true/false,
  "tokens": number
}
`,
        tools: [{ type: 'file_search' }],
        tool_resources: {
          file_search: {
            vector_store_ids: [this.vectorStoreId],
          },
        },
      }),
    });

    const data = (await response.json()) as { id: string };
    return data.id;
  }

  private async createThread(): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify({}),
    });

    const data = (await response.json()) as { id: string };
    return data.id;
  }

  private async addMessage(threadId: string, content: string): Promise<void> {
    await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify({
        role: 'user',
        content,
      }),
    });
  }

  private async runAssistant(threadId: string): Promise<string> {
    const response = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      {
        method: 'POST',
        headers: this.headers(true),
        body: JSON.stringify({
          assistant_id: this.assistantId,
        }),
      },
    );

    const data = (await response.json()) as { id: string };
    return data.id;
  }

  private async waitForRun(threadId: string, runId: string): Promise<string> {
    while (true) {
      await new Promise((res) => setTimeout(res, 1000));

      const response = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
        {
          method: 'GET',
          headers: this.headers(true),
        },
      );

      const data = (await response.json()) as {
        status: string;
      };

      if (data.status === 'completed') {
        break;
      }

      if (['failed', 'cancelled', 'expired'].includes(data.status)) {
        throw new Error(`Run failed: ${data.status}`);
      }
    }

    // Fetch messages
    const msgResponse = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        method: 'GET',
        headers: this.headers(true),
      },
    );

    const msgData = (await msgResponse.json()) as {
      data: Array<{
        role: string;
        content?: Array<{
          text?: {
            value?: string;
          };
        }>;
      }>;
    };
    const assistantMsg = msgData.data.find((m) => m.role === 'assistant');

    return assistantMsg?.content?.[0]?.text?.value ?? '';
  }

  // ==========================
  // UTIL
  // ==========================
  private headers(useBeta: boolean = false) {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...(useBeta ? { 'OpenAI-Beta': 'assistants=v2' } : {}),
    };
  }

  async uploadFileToVectorStore(file: {
    originalname: string;
    size: number;
    buffer: Buffer;
  }): Promise<{
    vectorStoreId: string;
    status: string;
    fileCount: number;
  }> {
    if (!this.vectorStoreId) {
      throw new InternalServerErrorException(
        'OPENAI_VECTOR_STORE_ID is not set',
      );
    }

    this.logger.log(
      `Uploading file "${file.originalname}" (${file.size} bytes) to vector store ${this.vectorStoreId}`,
    );

    try {
      // Step 1: Create a File object from the buffer
      const uint8Array = new Uint8Array(file.buffer);
      const blob = new Blob([uint8Array]);
      const fileObject = new File([blob], file.originalname);

      // Step 2: Upload the file using the new API
      await this.client.vectorStores.files.upload(
        this.vectorStoreId,
        fileObject,
      );

      this.logger.log('File uploaded successfully, waiting for processing...');

      // Step 3: Poll the vector store until processing is complete
      let isProcessing = true;
      while (isProcessing) {
        const vectorStore = await this.client.vectorStores.retrieve(
          this.vectorStoreId,
        );

        if (
          vectorStore.status === 'completed' ||
          vectorStore.file_counts.in_progress === 0
        ) {
          isProcessing = false;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      this.logger.log('File processing completed');

      return {
        vectorStoreId: this.vectorStoreId,
        status: 'uploaded_and_indexed',
        fileCount: 1,
      };
    } catch (error) {
      this.logger.error('Error uploading file to vector store', error);
      throw new InternalServerErrorException({
        message: 'Failed to upload file to vector store',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
