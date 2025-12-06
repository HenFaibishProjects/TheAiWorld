import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule],
})
export class LoginComponent {
  // Login fields
  username = '';
  password = '';
  
  // Register fields
  regUsername = '';
  regPassword = '';
  regPasswordConfirm = '';
  
  // UI state
  isRegisterMode = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private apiUrl = environment.apiUrl || 'http://localhost:3000';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/ai-menu']);
        } else {
          this.errorMessage = 'Invalid username or password';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Login failed. Please try again.';
        console.error('Login error:', err);
      }
    });
  }

  onRegister() {
    // Validation
    if (!this.regUsername || this.regUsername.length < 3) {
      this.errorMessage = 'Username must be at least 3 characters';
      return;
    }

    if (!this.regPassword || this.regPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    if (this.regPassword !== this.regPasswordConfirm) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Call register endpoint
    this.http.post(`${this.apiUrl}/login/register`, {
      username: this.regUsername,
      password: this.regPassword
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! You can now sign in.';
        
        // Clear form
        this.regUsername = '';
        this.regPassword = '';
        this.regPasswordConfirm = '';

        // Switch to login tab after 2 seconds
        setTimeout(() => {
          this.isRegisterMode = false;
          this.successMessage = '';
        }, 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Username may already exist.';
        console.error('Registration error:', err);
      }
    });
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
