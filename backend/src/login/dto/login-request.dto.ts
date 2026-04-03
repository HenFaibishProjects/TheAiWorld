import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(100, { message: 'Password must not exceed 100 characters' })
  password: string;
}
