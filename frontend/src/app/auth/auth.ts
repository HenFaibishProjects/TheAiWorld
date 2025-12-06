import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

const AUTH_STORAGE_KEY = 'auth_data';

interface AuthData {
  token: string;
  expiresAt: number; // timestamp (ms)
}

interface LoginResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  userId?: number;
  username?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // ---- PUBLIC API ----

  login(username: string, password: string): Observable<boolean> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          if (!response.success || !response.accessToken) {
            throw new Error(response.message || 'Login failed');
          }

          const expiresIn = 24 * 60 * 60; // 24h in seconds
          const expiresAt = Date.now() + expiresIn * 1000;

          const authData: AuthData = {
            token: response.accessToken,
            expiresAt,
          };
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        }),
        map(() => true),
        catchError((error) => {
          console.error('Login failed:', error);
          return of(false);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  isLoggedIn(): boolean {
    const data = this.getAuthData();
    if (!data) {
      return false;
    }

    if (Date.now() > data.expiresAt) {
      // expired – clean up
      this.logout();
      return false;
    }

    return true;
  }

  getToken(): string | null {
    const data = this.getAuthData();
    if (!data) {
      return null;
    }
    if (Date.now() > data.expiresAt) {
      this.logout();
      return null;
    }
    return data.token;
  }

  // ---- PRIVATE HELPERS ----

  private getAuthData(): AuthData | null {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as AuthData;
    } catch {
      this.logout();
      return null;
    }
  }
}