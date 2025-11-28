import { IsString, IsBoolean } from 'class-validator';

export class FtResponseDto {
  @IsString()
  answerInEnglish: string;

  @IsString()
  answerInRomanian: string;

  @IsString()
  translateToHebrew: string;

  @IsBoolean()
  isItSlang: boolean;
}
