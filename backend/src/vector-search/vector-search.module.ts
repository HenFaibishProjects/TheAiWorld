import { Module } from '@nestjs/common';
import { VectorSearchService } from './vector-search.service';
import { VectorSearchController } from './vector-search.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VectorEntity } from './dto/vector.entity';
import { OpenAIModule } from '../openai/openai.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  controllers: [VectorSearchController],
  providers: [VectorSearchService],
  imports: [TypeOrmModule.forFeature([VectorEntity]), OpenAIModule, ChatModule],
})
export class VectorSearchModule {}