import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { FtRequestDto } from './dto/ft-request.dto';
import { FtResponseDto } from './dto/ft-response.dto';
import { FtService } from './ft.service';

@Controller('ft')
export class FtController {
  private readonly logger = new Logger(FtController.name);
  constructor(private readonly ftService: FtService) {} 

   @Post()
    async send(@Body() query: FtRequestDto): Promise<FtResponseDto> {
        return await this.ftService.askWithFineTunning(query);
    }
}   