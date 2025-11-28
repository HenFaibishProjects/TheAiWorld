import { IsNotEmpty, IsString } from 'class-validator';

export class FtRequestDto {
  @IsNotEmpty()
  @IsString()
  query: string;
}
