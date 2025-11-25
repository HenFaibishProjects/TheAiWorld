import { Injectable } from '@nestjs/common';
import { RagResponse } from './rag-response';

@Injectable()
export class RagService {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly vectorStoreId = 'vs_6920ab0ec2f48191aa82cd3b209fb636';
  private assistantId: string | null = null;

  constructor() {}

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
      const parsed = JSON.parse(text);

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

    const data = await response.json();
    return data.id;
  }

  private async createThread(): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify({}),
    });

    const data = await response.json();
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

    const data = await response.json();
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

      const data = await response.json();

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

    const msgData = await msgResponse.json();
    const assistantMsg = msgData.data.find((m: any) => m.role === 'assistant');

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
}
