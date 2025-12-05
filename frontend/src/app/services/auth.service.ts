import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  userId?: number;
  username?: string;
  accessToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'accessToken';
  private readonly USERNAME_KEY = 'username';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, {
      username,
      password
    }).pipe(
      tap(response => {
        if (response.success && response.accessToken) {
          this.setToken(response.accessToken);
          if (response.username) {
            this.setUsername(response.username);
          }
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout(): void {
    this.clearToken();
    this.clearUsername();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUsername(username: string): void {
    localStorage.setItem(this.USERNAME_KEY, username);
  }

  private clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private clearUsername(): void {
    localStorage.removeItem(this.USERNAME_KEY);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}
