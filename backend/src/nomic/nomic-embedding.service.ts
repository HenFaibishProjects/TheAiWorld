import { Injectable } from "@nestjs/common";
import { NomicClient } from './nomic.client';


@Injectable()
export class NomicEmbeddingService {
  constructor(private readonly nomic: NomicClient) {}

  async embedText(text: string) {
    const vector = await this.nomic.embed(text);
    return { length: vector.length, vector };
  }
}

