import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Public()
  @Get('debug/env')
  debugEnv() {
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      jwtSecretSet: !!process.env.JWT_SECRET,
      jwtSecretPreview: jwtSecret.substring(0, 10) + '...',
      jwtSecretLength: jwtSecret.length,
      databaseUrlSet: !!process.env.DATABASE_URL,
    };
  }
}
