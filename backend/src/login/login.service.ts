import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AIUser } from './entities/user.entity';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class LoginService {
  private readonly logger = new Logger(LoginService.name);

  constructor(
    @InjectRepository(AIUser)
    private readonly userRepository: Repository<AIUser>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const { username, password } = loginDto;

    this.logger.log(`Login attempt for username: ${username}`);

    try {
      // Find user by username
      const user = await this.userRepository.findOne({
        where: { username },
      });
      if (!user) {
        this.logger.warn(`Login failed: User not found - ${username}`);
        return {
          success: false,
          message: 'Invalid username or password',
        };
      }

      // Compare password with hashed password
      const isPasswordValid = password==user.password? true:false;

      if (!isPasswordValid) {
        this.logger.warn(`Login failed: Invalid password for user - ${username}`);
        return {
          success: false,
          message: 'Invalid username or password',
        };
      }

      // Generate JWT token
      const payload = { sub: user.id, username: user.username };
      const accessToken = this.jwtService.sign(payload);

      this.logger.log(`Login successful for user: ${username}`);
      return {
        success: true,
        message: 'Login successful',
        userId: user.id,
        username: user.username,
        accessToken,
      };
    } catch (error) {
      this.logger.error(`Error during login: ${error.message}`, error.stack);
      throw new UnauthorizedException('Login failed');
    }
  }

  // Helper method to create a user (for testing purposes)
  async createUser(username: string, password: string): Promise<AIUser> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }
}
