import { 
  IsString, 
  IsOptional, 
  IsArray, 
  IsNumber, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';

export class AskResultDto {
  @IsString()
  content: string;

  @Type(() => Number)
  @IsNumber()
  distance: number;
}

export class AskTokensDto {
  @IsNumber()
  prompt: number;

  @IsNumber()
  response: number;

  @IsNumber()
  total: number;
}

export class AskDebugDto {
  @IsString()
  question: string;

  @IsNumber()
  chunksSent: number;

  @ValidateNested()
  @Type(() => AskTokensDto)
  tokens: AskTokensDto;

  @IsNumber()
  latencyMs: number;
}

export class AskResponseDto {
  @IsString()
  answer: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AskResultDto)
  results?: AskResultDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AskDebugDto)
  debug?: AskDebugDto;
}