import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    
    this.logger.log(`🔐 [JWT AUTH GUARD] Request: ${request.method} ${request.url}`);
    this.logger.log(`🔐 [JWT AUTH GUARD] Authorization header: ${authHeader ? 'Present' : 'Missing'}`);
    if (authHeader) {
      this.logger.log(`🔐 [JWT AUTH GUARD] Header preview: ${authHeader.substring(0, 30)}...`);
    }

    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.log('🔓 [JWT AUTH GUARD] Route is public, skipping auth');
      return true;
    }

    this.logger.log('🔒 [JWT AUTH GUARD] Route requires authentication, validating token...');
    return super.canActivate(context);
  }
}
