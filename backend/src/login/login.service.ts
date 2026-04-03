import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);

  // In-memory user store – credentials come from environment variables.
  // APP_USERNAME / APP_PASSWORD define the single allowed user.
  // The password is stored as a bcrypt hash so it is generated once on first use.
  private hashedPassword: string | null = null;

  constructor(private readonly jwtService: JwtService) {}

  private getCredentials(): { username: string; rawPassword: string } {
    const username = process.env.APP_USERNAME || '1';
    const rawPassword = process.env.APP_PASSWORD || '1';
    return { username, rawPassword };
  }

  private async getHashedPassword(): Promise<string> {
    if (!this.hashedPassword) {
      const { rawPassword } = this.getCredentials();
      this.hashedPassword = await bcrypt.hash(rawPassword, 10);
    }
    return this.hashedPassword;
  }

  async validateUser(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const { username, password } = loginDto;
    const creds = this.getCredentials();

    this.logger.log(`Login attempt for username: ${username}`);

    if (username !== creds.username) {
      this.logger.warn(`Login failed: User not found - ${username}`);
      return { success: false, message: 'Invalid username or password' };
    }

    const hash = await this.getHashedPassword();
    const isPasswordValid = await bcrypt.compare(password, hash);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for user - ${username}`);
      return { success: false, message: 'Invalid username or password' };
    }

    const payload = { sub: 1, username };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`Login successful for user: ${username}`);
    return {
      success: true,
      message: 'Login successful',
      userId: 1,
      username,
      accessToken,
    };
  }

  // Kept for API compatibility – no longer persists anything.
  async seedDefaultUser(): Promise<void> {
    const { username } = this.getCredentials();
    this.logger.log(`ℹ️  In-memory user ready (username: "${username}")`);
  }
}
