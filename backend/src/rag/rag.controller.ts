import {
  Get,
  Query,
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { RagService } from './rag.service';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';
import { Public } from 'src/auth/public.decorator';


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

  @Public()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadToRag(@UploadedFile() file: Multer.File) {
    if (!file) {
      throw new BadRequestException('file is required');
    }

    const result = await this.ragService.uploadFileToVectorStore(file);

    return {
      fileName: file.originalname,
      vectorStoreId: result.vectorStoreId,
      fileCount: result.fileCount,
      status: result.status,
    };
  }
}
