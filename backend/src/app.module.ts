import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { OpenAIEmbeddingController } from './openai/openai-embedding.controller';
import { NomicEmbeddingController } from './nomic/nomic-embedding.controller';
import { NomicEmbeddingService } from './nomic/nomic-embedding.service';
import { OpenAIEmbeddingService } from './openai/openai-embedding.service';
import { NomicClient } from './nomic/nomic.client';
import { OpenAIEmbeddingClient } from './openai/openai.client';
import { VectorUtilsModule } from './vector/vector-utils.module';
import { VectorUtilsService } from './vector/vector-utils.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [ChatModule, VectorUtilsModule],
  controllers: [
    HealthController,
    OpenAIEmbeddingController,
    NomicEmbeddingController,
  ],
  providers: [
    VectorUtilsService,
    NomicEmbeddingService,
    {
      provide: NomicClient,
      useFactory: () => {
        console.log("🔑 NOMIC KEY:", process.env.NOMIC_API_KEY);
        return new NomicClient(process.env.NOMIC_API_KEY!);
      },
    },
    OpenAIEmbeddingService,
    {
      provide: OpenAIEmbeddingClient,
      useFactory: () => {
        console.log("🔑 OpenAI KEY:", process.env.OPENAI_API_KEY);
        return new OpenAIEmbeddingClient(process.env.OPENAI_API_KEY!);
      },
    },
  ],
  exports: [OpenAIEmbeddingService, OpenAIEmbeddingClient, VectorUtilsService],
})
export class AppModule {}
