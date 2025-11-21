import { Injectable } from "@nestjs/common";
import { OpenAIEmbeddingClient } from './openai.client';

@Injectable()
export class OpenAIEmbeddingService {
  constructor(
    private readonly openai: OpenAIEmbeddingClient,
  ) {}

  async embedText(text: string) {
    const vector = await this.openai.embed(text);
    return { length: vector.length, vector };
  }

  async explainSimilarity(word1: string, word2: string, similarityScore: number): Promise<string> {
    return this.openai.explainSimilarity(word1, word2, similarityScore);
  }
}
