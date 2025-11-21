import { Module } from '@nestjs/common';
import { AIClient } from './ai.client';

@Module({
  providers: [
    {
      provide: AIClient,
      useFactory: () => new AIClient(process.env.CLAUDE_API_KEY ?? '')
    }
  ],
  exports: [AIClient],
})
export class AIModule {}
