import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AIClient } from '../ai/ai.client';
import { encodingForModel, Tiktoken } from 'js-tiktoken';
import type { ChatResponseDto } from './dto/chat-response.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private encoder: Tiktoken;
  private openaiApiKey: string;

  constructor(private readonly ai: AIClient) {
    // Initialize encoder for GPT-4
    this.encoder = encodingForModel('gpt-4');
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    
    if (!this.openaiApiKey) {
      this.logger.warn('OPENAI_API_KEY not found in environment variables');
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
    if (!this.openaiApiKey) {
      throw new HttpException(
        'OpenAI API key not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      // Count prompt tokens
      const promptTokens = this.countTokens(message);

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
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
  "what to seach in youtube": ""
}

Where:
- "subject" = a short string
- "what to seach in youtube" = keyword to search in youtube on this subject

User message:
"${message}"
            `,
              },
            ],
          }),
        },
      );

      const data = await response.json();
      this.logger.log('Received response from OpenAI');

      if (!response.ok) {
        this.logger.error('OpenAI API Error:', data);
        throw new HttpException(
          data?.error?.message || 'OpenAI API failed',
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
          error: 'No JSON found in OpenAI response',
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
      this.logger.error(`Error in askOpenAI: ${errorMessage}`);
      throw new HttpException(
        'Failed to get response from OpenAI',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
