import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('🌐 [AUTH INTERCEPTOR] Request URL:', req.url);
  console.log('🎫 [AUTH INTERCEPTOR] Token present:', token ? 'YES' : 'NO');
  if (token) {
    console.log('🎫 [AUTH INTERCEPTOR] Token preview:', token.substring(0, 20) + '...');
  }

  // Clone the request and add the authorization header if token exists
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('✅ [AUTH INTERCEPTOR] Authorization header added');
    return next(cloned);
  }

  console.log('⚠️ [AUTH INTERCEPTOR] No token, sending request without auth');
  return next(req);
};
