import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { RagModule } from './rag/rag.module';
import { OpenAIEmbeddingController } from './openai/openai-embedding.controller';
import { NomicEmbeddingController } from './nomic/nomic-embedding.controller';
import { NomicEmbeddingService } from './nomic/nomic-embedding.service';
import { OpenAIEmbeddingService } from './openai/openai-embedding.service';
import { NomicClient } from './nomic/nomic.client';
import { OpenAIEmbeddingClient } from './openai/openai.client';
import { VectorUtilsModule } from './vector/vector-utils.module';
import { VectorUtilsService } from './vector/vector-utils.service';
import { HealthController } from './health/health.controller';
import { FtModule } from './fineTuning/ft.module';
import { FtController } from './fineTuning/ft.controller';
import { FtService } from './fineTuning/ft.service';

@Module({
  imports: [ChatModule, RagModule, VectorUtilsModule, FtModule],
  controllers: [
    HealthController,
    OpenAIEmbeddingController,
    NomicEmbeddingController,
    FtController
  ],
  providers: [
    VectorUtilsService,
    FtService,
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
