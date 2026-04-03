import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AIClient } from '../ai/ai.client';
import { encodingForModel, Tiktoken } from 'js-tiktoken';
import type { ChatResponseDto } from './dto/chat-response.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private encoder: Tiktoken;
  private openaiApiKey: string;
  private deepseekApiKey: string;

  constructor(private readonly ai: AIClient) {
    // Initialize encoder for GPT-4
    this.encoder = encodingForModel('gpt-4');
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY || '';
    
    if (!this.openaiApiKey) {
      this.logger.warn('OPENAI_API_KEY not found in environment variables');
    }

    if (!this.deepseekApiKey) {
      this.logger.warn('DEEPSEEK_API_KEY not found in environment variables');
    }
    
    this.logger.log('ChatService initialized');
  }

  private countTokens(text: string): number {
    try {
      const tokens = this.encoder.encode(text);
      this.logger.log(`Counted ${tokens.length} tokens`);
      return tokens.length;
    } catch (error) {
      console.error('Error counting tokens:', error);
      return 0;
    }
  }

  async askClaude(message: string): Promise<ChatResponseDto> {
    try {
      // Count prompt tokens
      const promptTokens = this.countTokens(message);

      const res = await this.ai.sendMessage(message);
      this.logger.log('Received response from Claude');

      const text = res?.content?.[0]?.text?.trim() || '';

      // Count response tokens
      const responseTokens = this.countTokens(text);
      const totalTokens = promptTokens + responseTokens;

      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return {
          error: 'No JSON found in Claude response',
          raw: text,
          promptTokens,
          responseTokens,
          totalTokens,
        };
      }

      const jsonString = jsonMatch[0];

      try {
        const parsed = JSON.parse(jsonString);
        return {
          ...parsed,
          promptTokens,
          responseTokens,
          totalTokens,
        };
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        return {
          error: 'Invalid JSON returned',
          raw: jsonString,
          details: errorMessage,
          promptTokens,
          responseTokens,
          totalTokens,
        };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in askClaude: ${errorMessage}`);
      throw new HttpException(
        'Failed to get response from Claude',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async askOpenAI(message: string): Promise<ChatResponseDto> {
    return this.askGenericOpenAICompatible(
      'openai',
      'https://api.openai.com/v1/chat/completions',
      this.openaiApiKey,
      'gpt-4o-mini',
      message
    );
  }

  async askDeepSeek(message: string): Promise<ChatResponseDto> {
    return this.askGenericOpenAICompatible(
      'deepseek',
      'https://api.deepseek.com/v1/chat/completions',
      this.deepseekApiKey,
      'deepseek-chat',
      message
    );
  }

  private async askGenericOpenAICompatible(
    provider: string,
    url: string,
    apiKey: string,
    model: string,
    message: string
  ): Promise<ChatResponseDto> {
    if (!apiKey) {
      throw new HttpException(
        `${provider.toUpperCase()} API key not configured`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      // Count prompt tokens
      const promptTokens = this.countTokens(message);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          max_tokens: 60,
          messages: [
            {
              role: 'user',
              content: `
Return ONLY a valid JSON object.
No explanations. No markdown. No text before or after the JSON.

Use this exact schema (valid JSON object):
{
  "subject": "",
  "do the ai know the answer": "",
  "the answer": ""
}

Where:
- "subject" = a short string
- "do the ai know the answer" = "yes" or "no",
- "the answer" = detailed answer to the question

User message:
"${message}"
            `,
            },
          ],
        }),
      });

      const data = await response.json();
      this.logger.log(`Received response from ${provider}`);

      if (!response.ok) {
        this.logger.error(`${provider.toUpperCase()} API Error:`, data);
        throw new HttpException(
          data?.error?.message || `${provider.toUpperCase()} API failed`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const text = data?.choices?.[0]?.message?.content?.trim() || '';

      // Count response tokens
      const responseTokens = this.countTokens(text);
      const totalTokens = promptTokens + responseTokens;

      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        return {
          error: `No JSON found in ${provider} response`,
          raw: text,
          promptTokens,
          responseTokens,
          totalTokens,
        };
      }

      const jsonString = jsonMatch[0];

      try {
        const parsed = JSON.parse(jsonString);
        return {
          ...parsed,
          promptTokens,
          responseTokens,
          totalTokens,
        };
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        return {
          error: 'Invalid JSON returned',
          raw: jsonString,
          details: errorMessage,
          promptTokens,
          responseTokens,
          totalTokens,
        };
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error in askGenericOpenAICompatible for ${provider}: ${errorMessage}`);
      throw new HttpException(
        `Failed to get response from ${provider}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
