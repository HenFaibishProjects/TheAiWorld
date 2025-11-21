import { Module } from '@nestjs/common';
import { VectorUtilsService } from './vector-utils.service';

@Module({
  controllers: [],
  providers: [VectorUtilsService],
  exports: [VectorUtilsService],
})
export class VectorUtilsModule {}
