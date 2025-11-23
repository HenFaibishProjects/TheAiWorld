import {
  Controller,
  Post,
  Body,
  Get,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AIConfig } from '../ai/ai.config';
import type { ChatRequestDto } from './dto/chat-request.dto';
import type { ChatResponseDto, ModelInfoDto } from './dto/chat-response.dto';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Get('model')
  getModelInfo(): ModelInfoDto {
    this.logger.log('Fetching model information');
    return {
      model: AIConfig.model,
      temperature: AIConfig.temperature,
      maxTokens: AIConfig.maxTokens,
    };
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async send(@Body() chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    const { message, provider } = chatRequest;

    this.logger.log(`Received chat request for provider: ${provider}`);

    try {
      if (provider === 'openai') {
        return await this.chatService.askOpenAI(message);
      }
      if (provider === 'claude') {
        return await this.chatService.askClaude(message);
      }

      throw new HttpException(
        'Invalid provider specified',
        HttpStatus.BAD_REQUEST,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error processing chat request: ${errorMessage}`,
        errorStack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to process chat request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
