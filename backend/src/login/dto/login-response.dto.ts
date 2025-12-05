export class LoginResponseDto {
  success: boolean;
  message: string;
  userId?: number;
  username?: string;
  accessToken?: string;
}
