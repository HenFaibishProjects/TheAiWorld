import { Controller, Post, Body } from "@nestjs/common";
import { NomicEmbeddingService } from "./nomic-embedding.service";

@Controller("embed/nomic")
export class NomicEmbeddingController  {
  constructor(private readonly embeddingService: NomicEmbeddingService) {}

  @Post()
  async generate(@Body("text") text: string) {
    return this.embeddingService.embedText(text);
  }
}
