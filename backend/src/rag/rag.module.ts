import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { OpenAIClient } from './openai.client';
@Module({
  controllers: [RagController],
  providers: [RagService, OpenAIClient],})
export class RagModule {}
