import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import type {
  ChatResponse,
  ModelInfo,
  AIProvider,
} from './models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) {}

  getModelInfo(): Observable<ModelInfo> {
    console.log('Fetching model info from backend');
    return this.http.get<ModelInfo>(`${this.apiUrl}/model`).pipe(
      tap((info) => console.log('Model info received:', info)),
      catchError(this.handleError),
    );
  }

  send(message: string, provider: AIProvider): Observable<ChatResponse> {
    console.log(`Sending message to backend with provider: ${provider}`);

    if (!message || !message.trim()) {
      return throwError(() => new Error('Message cannot be empty'));
    }

    return this.http
      .post<ChatResponse>(this.apiUrl, { message, provider })
      .pipe(
        tap((response) => console.log('Response received:', response)),
        catchError(this.handleError),
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('ChatService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
