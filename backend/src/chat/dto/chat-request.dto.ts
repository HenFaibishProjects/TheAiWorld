import { IsString, IsNotEmpty, IsIn, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @MaxLength(10000, { message: 'Message must not exceed 10000 characters' })
  message: string;

  @IsString()
  @IsNotEmpty({ message: 'Provider is required' })
  @IsIn(['openai', 'claude'], { message: 'Provider must be either "openai" or "claude"' })
  provider: string;
}
