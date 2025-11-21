import { Controller, Post, Body } from "@nestjs/common";
import { OpenAIEmbeddingService } from "./openai-embedding.service";
import { VectorUtilsService } from "src/vector/vector-utils.service";

@Controller("embed/openai")
export class OpenAIEmbeddingController  {
  constructor(private readonly embeddingService: OpenAIEmbeddingService,
    private readonly utils: VectorUtilsService,
  ) {}

  @Post()
  async generate(@Body("text") text: string) {
    return this.embeddingService.embedText(text);
  }

  @Post('compare')
  async compare(@Body() body: { word1: string; word2: string }) {
    const vec1 = await this.embeddingService.embedText(body.word1);
    const vec2 = await this.embeddingService.embedText(body.word2);

    const similarity = this.utils.cosineSimilarity(vec1.vector, vec2.vector);

    // Generate AI explanation for the similarity score
    const explanation = await this.embeddingService.explainSimilarity(
      body.word1,
      body.word2,
      similarity
    );

    return {
      word1: body.word1,
      word2: body.word2,
      similarity: (similarity * 100).toFixed(2) + "%",
      similarityExplanation: explanation,
      word1_preview: this.utils.preview(vec1.vector),
      word2_preview: this.utils.preview(vec2.vector)
    };
  }
}
