import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ChatModule } from './chat/chat.module';
import { RagModule } from './rag/rag.module';
import { LoginModule } from './login/login.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { NomicEmbeddingController } from './nomic/nomic-embedding.controller';
import { NomicEmbeddingService } from './nomic/nomic-embedding.service';
import { NomicClient } from './nomic/nomic.client';
import { VectorUtilsModule } from './vector/vector-utils.module';
import { OpenAIModule } from './openai/openai.module';
import { VectorUtilsService } from './vector/vector-utils.service';
import { HealthController } from './health/health.controller';
import { FtModule } from './fineTuning/ft.module';
import { FtController } from './fineTuning/ft.controller';
import { FtService } from './fineTuning/ft.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VectorSearchModule } from './vector-search/vector-search.module';

@Module({
  imports: [
    AuthModule,
    ChatModule,
    RagModule,
    LoginModule,
    VectorUtilsModule,
    FtModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  synchronize: true,
  }),
  VectorSearchModule,
  OpenAIModule,
  ],
  controllers: [
    HealthController,
    NomicEmbeddingController,
    FtController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    VectorUtilsService,
    FtService,
    NomicEmbeddingService,
    {
      provide: NomicClient,
      useFactory: () => {
        console.log("🔑 NOMIC KEY:", process.env.NOMIC_API_KEY);
        return new NomicClient(process.env.NOMIC_API_KEY!);
      },
    },
  ],
  exports: [VectorUtilsService],
})
export class AppModule {}
