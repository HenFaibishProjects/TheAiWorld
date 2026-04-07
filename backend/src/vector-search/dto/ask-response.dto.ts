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

export class AskDebugDto {
  @IsOptional()
  @IsNumber()
  bestDistance?: number;

  @IsOptional()
  @IsNumber()
  resultCount?: number;
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