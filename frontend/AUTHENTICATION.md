# Frontend Authentication Documentation

## Overview
The Angular frontend now implements route guards and HTTP interceptors to protect all pages from unauthorized access. Users must be authenticated to access any page except the login page.

## Architecture

### Components

1. **Auth Service** (`src/app/services/auth.service.ts`)
   - Manages authentication state
   - Handles login/logout operations
   - Stores and retrieves JWT tokens from localStorage
   - Provides authentication status observable

2. **Auth Guard** (`src/app/guards/auth.guard.ts`)
   - Protects routes from unauthorized access
   - Redirects unauthenticated users to login page
   - Preserves return URL for post-login redirect

3. **Auth Interceptor** (`src/app/interceptors/auth.interceptor.ts`)
   - Automatically adds JWT token to all HTTP requests
   - Adds Authorization header with Bearer token

4. **Error Interceptor** (`src/app/interceptors/error.interceptor.ts`)
   - Handles 401 Unauthorized errors
   - Automatically logs out user and redirects to login
   - Clears expired/invalid tokens

## Protected Routes

All routes except `/login` are protected by the auth guard:

- `/ai-menu` - AI Menu (default after login)
- `/prompt` - Prompt interface
- `/embedding` - Embedding tools
- `/vector-compare` - Vector comparison
- `/rag` - RAG operations
- `/fine-tuning` - Fine-tuning tools

## Authentication Flow

### 1. User Login

1. User navigates to `/login`
2. Enters username and password
3. Frontend sends credentials to backend `/login` endpoint
4. Backend validates and returns JWT token
5. Frontend stores token in localStorage
6. User is redirected to requested page or `/ai-menu`

### 2. Accessing Protected Pages

1. User tries to access a protected route
2. Auth guard checks if user has valid token
3. If authenticated: Allow access
4. If not authenticated: Redirect to `/login` with return URL

### 3. Making API Requests

1. User performs action that requires API call
2. Auth interceptor automatically adds token to request headers
3. Backend validates token
4. If valid: Process request
5. If invalid/expired: Return 401 error
6. Error interceptor catches 401, logs out user, redirects to login

### 4. Token Expiration

1. Token expires after 24 hours (configurable)
2. Next API request returns 401 Unauthorized
3. Error interceptor automatically logs out user
4. User is redirected to login page
5. User must log in again to get new token

## Implementation Details

### Auth Service

```typescript
// Login
this.authService.login(username, password).subscribe({
  next: (response) => {
    if (response.success) {
      // Token automatically stored
      // Navigate to protected route
    }
  }
});

// Logout
this.authService.logout(); // Clears token and redirects to login

// Check authentication status
const isAuth = this.authService.isAuthenticated();

// Get current user
const username = this.authService.getUsername();
```

### Route Protection

Routes are protected in `app.routes.ts`:

```typescript
{
  path: 'protected-route',
  component: ProtectedComponent,
  canActivate: [authGuard]  // Requires authentication
}
```

### HTTP Interceptors

Interceptors are registered in `app.config.ts`:

```typescript
provideHttpClient(
  withInterceptors([authInterceptor, errorInterceptor])
)
```

## User Experience

### First Visit
1. User opens application
2. Automatically redirected to `/login`
3. Sees login form

### After Login
1. User enters credentials
2. On success, redirected to requested page or `/ai-menu`
3. Token stored in localStorage
4. All subsequent requests include token

### Navigation
1. User can navigate freely between protected pages
2. Token automatically included in all API requests
3. Logout button visible in navigation menu

### Session Expiration
1. Token expires after 24 hours
2. Next API request fails with 401
3. User automatically logged out
4. Redirected to login page
5. Can log in again to continue

### Direct URL Access
1. User tries to access `/prompt` directly
2. Auth guard checks authentication
3. If not logged in: Redirect to `/login?returnUrl=/prompt`
4. After login: Redirect back to `/prompt`

## Security Features

✅ **Route Protection**: All pages protected except login
✅ **Automatic Token Management**: Tokens stored securely in localStorage
✅ **Token Injection**: Automatically added to all API requests
✅ **Session Expiration Handling**: Auto-logout on token expiration
✅ **Return URL Preservation**: Users redirected to intended page after login
✅ **Logout Functionality**: Clear token and redirect to login

## Testing

### 1. Test Login Flow

```bash
# Start the application
cd frontend && npm start

# Navigate to http://localhost:4200
# Should redirect to /login

# Enter credentials:
# Username: testuser
# Password: password123

# Should redirect to /ai-menu
```

### 2. Test Route Protection

```bash
# While logged out, try to access:
http://localhost:4200/prompt

# Should redirect to:
http://localhost:4200/login?returnUrl=/prompt

# After login, should redirect back to /prompt
```

### 3. Test Token Expiration

```bash
# 1. Login successfully
# 2. Open browser DevTools > Application > Local Storage
# 3. Delete the 'accessToken' entry
# 4. Try to make an API call (e.g., send a chat message)
# 5. Should be automatically logged out and redirected to login
```

### 4. Test Logout

```bash
# 1. Login successfully
# 2. Click "Logout" button in navigation
# 3. Should be redirected to /login
# 4. Token should be cleared from localStorage
# 5. Trying to access protected routes should redirect to login
```

## Troubleshooting

### Can't access any pages
- Check if you're logged in
- Verify token exists in localStorage (DevTools > Application > Local Storage)
- Check browser console for errors
- Ensure backend is running and accessible

### Redirected to login immediately after logging in
- Check backend response includes `accessToken`
- Verify token is being stored in localStorage
- Check browser console for errors
- Ensure backend JWT_SECRET matches

### API requests fail with 401
- Token may have expired (24h default)
- Token may be invalid
- Backend may not be receiving token
- Check Network tab in DevTools to see if Authorization header is present

### Logout button not visible
- Check if username is being retrieved from localStorage
- Verify AuthService.getUsername() returns value
- Check browser console for errors

## Configuration

### Token Storage

Tokens are stored in browser localStorage:
- Key: `accessToken`
- Value: JWT token string

### Return URL

When redirected to login, the original URL is preserved:
```
/login?returnUrl=/original-page
```

After successful login, user is redirected to the return URL.

### Default Redirect

If no return URL is specified, users are redirected to `/ai-menu` after login.

## Best Practices

1. **Never log tokens**: Tokens should never be logged to console in production
2. **HTTPS in production**: Always use HTTPS to prevent token interception
3. **Token expiration**: Keep token expiration reasonable (24h default)
4. **Logout on close**: Consider implementing logout on browser close for sensitive applications
5. **Refresh tokens**: Consider implementing refresh tokens for better UX

## Adding New Protected Routes

To add a new protected route:

```typescript
// In app.routes.ts
{
  path: 'new-feature',
  component: NewFeatureComponent,
  canActivate: [authGuard]  // Add this line
}
```

## Making Authenticated API Calls

No special code needed! The auth interceptor automatically adds the token:

```typescript
// This request will automatically include the Authorization header
this.http.post('https://theaiworld.onrender.com/api/endpoint', data)
  .subscribe(response => {
    // Handle response
  });
```

## Logout Implementation

The logout button is in the navigation component:

```html
<li class="nav-item" *ngIf="username">
  <a (click)="logout()" class="logout-link">
    <span>Logout ({{ username }})</span>
  </a>
</li>
```

```typescript
logout() {
  this.authService.logout();
  this.closeMenu();
}
```

## Summary

The frontend authentication system provides:
- ✅ Complete route protection
- ✅ Automatic token management
- ✅ Seamless API authentication
- ✅ Session expiration handling
- ✅ User-friendly login/logout flow
- ✅ Return URL preservation
- ✅ Secure token storage

Users cannot access any page without logging in first, and all API requests are automatically authenticated with the JWT token.
