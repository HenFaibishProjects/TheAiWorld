import { Module, Global } from '@nestjs/common';
import { OpenAIEmbeddingController } from './openai-embedding.controller';
import { OpenAIEmbeddingService } from './openai-embedding.service';
import { OpenAIEmbeddingClient } from './openai.client';
import { VectorUtilsModule } from '../vector/vector-utils.module';

@Module({
  imports: [VectorUtilsModule],
  controllers: [OpenAIEmbeddingController],
  providers: [
    OpenAIEmbeddingService,
    {
      provide: OpenAIEmbeddingClient,
      useFactory: () => {
        return new OpenAIEmbeddingClient(process.env.OPENAI_API_KEY || '');
      },
    },
  ],
  exports: [OpenAIEmbeddingService, OpenAIEmbeddingClient],
})
export class OpenAIModule {}
