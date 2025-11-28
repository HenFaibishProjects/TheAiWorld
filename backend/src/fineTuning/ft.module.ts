import { Module } from '@nestjs/common';

import { AIModule } from '../ai/ai.module';
import { FtController } from './ft.controller';
import { FtService } from './ft.service';

@Module({
  imports: [AIModule],
  controllers: [FtController],
  providers: [FtService],
})
export class FtModule {}
