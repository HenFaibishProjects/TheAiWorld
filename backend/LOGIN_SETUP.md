# Login Endpoint Setup Guide

## Overview
A new login endpoint has been created at `/login` that validates user credentials against a PostgreSQL database.

## Prerequisites
1. PostgreSQL installed and running
2. Node.js and npm installed
3. All dependencies installed (run `npm install` in the backend directory)

## Database Setup

### 1. Create the Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE theaiworld;

# Exit psql
\q
```

### 2. Configure Environment Variables
The `.env` file has been updated with database configuration:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=theaiworld
```

Update these values according to your PostgreSQL setup.

### 3. Start the Application
The application will automatically create the `users` table when it starts (TypeORM synchronize is enabled).

```bash
npm run start:dev
```

## Creating Test Users

### Option 1: Using the API (Recommended for Testing)
You can create a test user by temporarily adding an endpoint or using the service directly. Here's a simple script:

```typescript
// Create a file: backend/src/scripts/create-user.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LoginService } from '../login/login.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const loginService = app.get(LoginService);
  
  await loginService.createUser('testuser', 'password123');
  console.log('Test user created successfully!');
  
  await app.close();
}

bootstrap();
```

### Option 2: Direct Database Insert
After the table is created, you can insert a user directly:

```sql
-- Password is 'password123' hashed with bcrypt
INSERT INTO users (username, password, created_at, updated_at) 
VALUES ('testuser', '$2b$10$K8ZqVZ5YJ5YJ5YJ5YJ5YJOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq', NOW(), NOW());
```

Note: You'll need to generate a proper bcrypt hash for the password.

## Testing the Login Endpoint

### Using cURL
```bash
# Successful login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# Failed login (wrong password)
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "wrongpassword"}'

# Failed login (user not found)
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "nonexistent", "password": "password123"}'
```

### Expected Responses

**Success:**
```json
{
  "success": true,
  "message": "Login successful",
  "userId": 1,
  "username": "testuser"
}
```

**Failure:**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

## API Endpoint Details

### POST /login

**Request Body:**
```json
{
  "username": "string (3-50 characters, required)",
  "password": "string (6-100 characters, required)"
}
```

**Response:**
```json
{
  "success": "boolean",
  "message": "string",
  "userId": "number (optional, only on success)",
  "username": "string (optional, only on success)"
}
```

**Validation Rules:**
- Username: 3-50 characters, required
- Password: 6-100 characters, required

## File Structure

```
backend/src/login/
├── dto/
│   ├── login-request.dto.ts   # Request validation
│   └── login-response.dto.ts  # Response structure
├── entities/
│   └── user.entity.ts         # User database entity
├── login.controller.ts        # HTTP endpoint handler
├── login.service.ts           # Business logic
└── login.module.ts            # Module configuration
```

## Security Notes

1. Passwords are hashed using bcrypt with a salt round of 10
2. The endpoint returns generic error messages to prevent username enumeration
3. In production, set `synchronize: false` in TypeORM configuration
4. Consider adding rate limiting to prevent brute force attacks
5. Consider implementing JWT tokens for session management

## Integration with Frontend

The frontend can call this endpoint from the login component:

```typescript
// In your login service
login(username: string, password: string): Observable<LoginResponse> {
  return this.http.post<LoginResponse>('http://localhost:3000/login', {
    username,
    password
  });
}
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check database exists: `psql -U postgres -l`
- Verify credentials in `.env` file

### Table Not Created
- Check application logs for TypeORM errors
- Ensure `synchronize: true` in app.module.ts
- Manually create table if needed (see setup-database.sql)

### Authentication Failures
- Verify user exists in database
- Check password hash is correct
- Review application logs for detailed error messages
