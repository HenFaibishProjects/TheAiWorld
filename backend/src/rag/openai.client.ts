import { Injectable } from '@nestjs/common';

@Injectable()
export class OpenAIClient {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    this.apiKey = apiKey;
  }

  getApiKey(): string {
    return this.apiKey;
  }
}
