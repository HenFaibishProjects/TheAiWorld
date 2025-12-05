import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LoginService } from '../login/login.service';

async function bootstrap() {
  console.log('Creating test user...');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const loginService = app.get(LoginService);

  try {
    const user = await loginService.createUser('testuser', 'password123');
    console.log('✅ Test user created successfully!');
    console.log(`   Username: ${user.username}`);
    console.log(`   User ID: ${user.id}`);
    console.log('\nYou can now test the login endpoint with:');
    console.log('   Username: testuser');
    console.log('   Password: password123');
  } catch (error) {
    if (error.code === '23505') {
      console.log('⚠️  User already exists!');
    } else {
      console.error('❌ Error creating user:', error.message);
    }
  }

  await app.close();
}

bootstrap();
