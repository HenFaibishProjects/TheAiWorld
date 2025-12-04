import { Injectable } from '@angular/core';

const AUTH_STORAGE_KEY = 'auth_data';

interface AuthData {
  token: string;
  expiresAt: number; // timestamp (ms)
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // ---- PUBLIC API ----

  login(username: string, password: string): boolean {
    // TODO: later call backend here.
    // For now: simple mock – accept any non-empty username/password.
    if (!username || !password) {
      return false;
    }

    const fakeToken = 'fake-token-' + Date.now();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // +1 day

    const authData: AuthData = { token: fakeToken, expiresAt };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));

    return true;
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
