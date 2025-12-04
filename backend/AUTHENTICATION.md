# Authentication System Documentation

## Overview
The backend now implements JWT-based authentication to protect all endpoints from unauthorized access. Only authenticated users with valid JWT tokens can access protected endpoints.

## Architecture

### Components

1. **JWT Strategy** (`src/auth/jwt.strategy.ts`)
   - Validates JWT tokens from Authorization headers
   - Extracts user information from token payload
   - Verifies user exists in database

2. **JWT Auth Guard** (`src/auth/jwt-auth.guard.ts`)
   - Global guard applied to all endpoints
   - Checks for valid JWT tokens
   - Allows public endpoints marked with @Public() decorator

3. **Public Decorator** (`src/auth/public.decorator.ts`)
   - Marks endpoints that don't require authentication
   - Used for login and health check endpoints

4. **Auth Module** (`src/auth/auth.module.ts`)
   - Configures JWT module with secret and expiration
   - Exports JWT and Passport modules for use in other modules

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h
```

**Important:** Change the JWT_SECRET to a strong, random string in production!

## Authentication Flow

### 1. User Login

**Endpoint:** `POST /login`

**Request:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "userId": 1,
  "username": "testuser",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Failure Response:**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

### 2. Accessing Protected Endpoints

All endpoints (except `/login` and `/health`) require authentication.

**Include the JWT token in the Authorization header:**

```bash
curl -X POST http://localhost:3000/chat \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "provider": "openai"}'
```

### 3. Token Expiration

Tokens expire after 24 hours (configurable via JWT_EXPIRATION).
When a token expires, users must log in again to get a new token.

## Public Endpoints

The following endpoints are accessible without authentication:

- `POST /login` - User login
- `GET /health` - Health check

## Protected Endpoints

All other endpoints require a valid JWT token:

- `POST /chat` - Chat with AI
- `POST /rag/*` - RAG operations
- `POST /openai/*` - OpenAI operations
- `POST /nomic/*` - Nomic operations
- `POST /ft/*` - Fine-tuning operations
- All other endpoints

## Error Responses

### 401 Unauthorized

Returned when:
- No token is provided
- Token is invalid or malformed
- Token has expired
- User associated with token no longer exists

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Frontend Integration

### Storing the Token

After successful login, store the access token:

```typescript
// In your login service
login(username: string, password: string): Observable<LoginResponse> {
  return this.http.post<LoginResponse>('http://localhost:3000/login', {
    username,
    password
  }).pipe(
    tap(response => {
      if (response.success && response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
      }
    })
  );
}
```

### Adding Token to Requests

Use an HTTP interceptor to automatically add the token to all requests:

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(cloned);
    }
    
    return next.handle(req);
  }
}
```

### Handling 401 Errors

Redirect to login page when token expires:

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          localStorage.removeItem('accessToken');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
```

## Testing Authentication

### 1. Create a Test User

```bash
cd backend && npm run create-test-user
```

### 2. Login and Get Token

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

Copy the `accessToken` from the response.

### 3. Test Protected Endpoint

```bash
# Without token (should fail with 401)
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "provider": "openai"}'

# With token (should succeed)
curl -X POST http://localhost:3000/chat \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "provider": "openai"}'
```

### 4. Test Public Endpoint

```bash
# Health check (no token needed)
curl http://localhost:3000/health
```

## Security Best Practices

1. **JWT Secret**
   - Use a strong, random secret in production
   - Never commit the secret to version control
   - Rotate secrets periodically

2. **Token Expiration**
   - Keep expiration time reasonable (24h is default)
   - Implement refresh tokens for better UX
   - Consider shorter expiration for sensitive operations

3. **HTTPS**
   - Always use HTTPS in production
   - Tokens sent over HTTP can be intercepted

4. **Password Security**
   - Passwords are hashed with bcrypt (salt rounds: 10)
   - Never log or expose passwords
   - Implement password complexity requirements

5. **Rate Limiting**
   - Consider adding rate limiting to login endpoint
   - Prevents brute force attacks

## Troubleshooting

### "Unauthorized" on all requests
- Check if token is being sent in Authorization header
- Verify token format: `Bearer <token>`
- Check if token has expired
- Verify JWT_SECRET matches between token generation and validation

### Token validation fails
- Ensure JWT_SECRET is set correctly
- Check token hasn't been tampered with
- Verify user still exists in database

### Can't access any endpoints
- Check if JwtAuthGuard is properly configured
- Verify AuthModule is imported in AppModule
- Ensure @Public() decorator is on login endpoint

## Adding New Public Endpoints

To make an endpoint public (no authentication required):

```typescript
import { Public } from '../auth/public.decorator';

@Controller('my-controller')
export class MyController {
  @Public()
  @Get('public-endpoint')
  publicMethod() {
    return { message: 'This is public' };
  }

  @Get('protected-endpoint')
  protectedMethod() {
    return { message: 'This requires authentication' };
  }
}
```

## Token Payload Structure

The JWT token contains:

```json
{
  "sub": 1,              // User ID
  "username": "testuser", // Username
  "iat": 1234567890,     // Issued at (timestamp)
  "exp": 1234654290      // Expiration (timestamp)
}
```

Access user information in controllers:

```typescript
import { Request } from 'express';

@Controller('example')
export class ExampleController {
  @Get()
  getExample(@Req() req: Request) {
    const user = req.user; // AIUser entity
    return { userId: user.id, username: user.username };
  }
}
