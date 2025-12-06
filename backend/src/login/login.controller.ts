import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Public } from '../auth/public.decorator';

@Controller('login')
export class LoginController {
  private readonly logger = new Logger(LoginController.name);

  constructor(private readonly loginService: LoginService) {}

  @Public()
  @Post()
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    this.logger.log(`Login request received for username: ${loginDto.username}`);

    try {
      const result = await this.loginService.validateUser(loginDto);
      
      if (!result.success) {
        this.logger.warn(`Login failed for username: ${loginDto.username}`);
      }
      
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Error processing login request: ${errorMessage}`,
        errorStack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to process login request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    this.logger.log(`Registration request for username: ${body.username}`);
    const user = await this.loginService.createUser(body.username, body.password);
    return {
      success: true,
      message: 'User created successfully',
      userId: user.id,
      username: user.username,
    };
  }
}
