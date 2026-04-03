import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: number;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    });

    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    this.logger.log(`🔑 [JWT STRATEGY] Initialized with JWT_SECRET: ${jwtSecret.substring(0, 10)}...`);
  }

  async validate(payload: JwtPayload): Promise<{ id: number; username: string }> {
    this.logger.log(`🔍 [JWT STRATEGY] Validating JWT payload`);
    this.logger.log(`🔍 [JWT STRATEGY] Payload sub (user ID): ${payload.sub}`);
    this.logger.log(`🔍 [JWT STRATEGY] Payload username: ${payload.username}`);

    const expectedUsername = process.env.APP_USERNAME || '1';

    if (payload.username !== expectedUsername) {
      this.logger.error(`❌ [JWT STRATEGY] Unknown user in token: ${payload.username}`);
      throw new UnauthorizedException('User not found');
    }

    this.logger.log(`✅ [JWT STRATEGY] User validated: ${payload.username}`);
    return { id: payload.sub, username: payload.username };
  }
}
