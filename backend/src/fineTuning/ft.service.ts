import OpenAI from 'openai';
import { FtRequestDto } from './dto/ft-request.dto';
import { FtResponseDto } from './dto/ft-response.dto';
import { FT_MODEL } from '../ai/ai.config';
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';


@Injectable()
export class FtService {
  private client: OpenAI;
  private readonly logger = new Logger(FtService.name);

  constructor() {
    
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async askWithFineTunning(payload: FtRequestDto): Promise<FtResponseDto> {
    try {
      const response = await this.client.responses.create({
        model: FT_MODEL,
        input: payload.query,
      });

      const raw = response.output_text;

      // Always ensure JSON
      this.logger.log("📝 Raw OpenAI response:",);
      this.logger.log("📏 Response length:", raw.length);
      const parsed: FtResponseDto = JSON.parse(raw);
      this.logger.log("✅ OpenAI response:", parsed);
      return parsed;

    } catch (error) {
      this.logger.error("❌ OpenAI error:", error);

      throw new InternalServerErrorException({
        message: "OpenAI request failed",
        error: error?.message || error,
        model: FT_MODEL,
      });
    }
  }
}
