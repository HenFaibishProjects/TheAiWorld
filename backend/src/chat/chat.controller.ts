import { Controller, Post, Body, Get } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AIConfig } from '../ai/ai.config';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('model')
  getModelInfo() {
    return {
      model: AIConfig.model,
      temperature: AIConfig.temperature,
      maxTokens: AIConfig.maxTokens,
    };
  }

  @Post()
  async send(@Body('message') message: string, @Body('provider') provider: string) {
    if (provider === 'openai') {
      return this.chatService.askOpenAI(message);
    }
    if (provider === 'claude') {
      return this.chatService.askClaude(message); 
    } 
  }
}
