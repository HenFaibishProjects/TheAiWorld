import { Controller, Get, Query } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('rag')
export class RagController {
  constructor(private ragService: RagService) {}

  @Get()
  async ragQuery(@Query('q') q: string) {
    return {
      query: q,
      answer: await this.ragService.ask(q),
    };
  }
}
