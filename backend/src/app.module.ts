import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { RagModule } from './rag/rag.module';
import { LoginModule } from './login/login.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { OpenAIEmbeddingController } from './openai/openai-embedding.controller';
import { NomicEmbeddingController } from './nomic/nomic-embedding.controller';
import { NomicEmbeddingService } from './nomic/nomic-embedding.service';
import { OpenAIEmbeddingService } from './openai/openai-embedding.service';
import { NomicClient } from './nomic/nomic.client';
import { OpenAIEmbeddingClient } from './openai/openai.client';
import { VectorUtilsModule } from './vector/vector-utils.module';
import { VectorUtilsService } from './vector/vector-utils.service';
import { HealthController } from './health/health.controller';
import { FtModule } from './fineTuning/ft.module';
import { FtController } from './fineTuning/ft.controller';
import { FtService } from './fineTuning/ft.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AIUser } from './login/entities/user.entity';


@Module({
  imports: [
   TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [AIUser],
  synchronize: true,

  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false
    }
  }
}),
    AuthModule,
    ChatModule,
    RagModule,
    LoginModule,
    VectorUtilsModule,
    FtModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  ],
  controllers: [
    HealthController,
    OpenAIEmbeddingController,
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
    OpenAIEmbeddingService,
    {
      provide: OpenAIEmbeddingClient,
      useFactory: () => {
        return new OpenAIEmbeddingClient(process.env.OPENAI_API_KEY!);
      },
    },
  ],
  exports: [OpenAIEmbeddingService, OpenAIEmbeddingClient, VectorUtilsService],
})
export class AppModule {}
