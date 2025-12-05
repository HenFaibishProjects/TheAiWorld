import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmbeddingService {
  private baseUrl = 'https://theaiworld.onrender.com/embed';

  constructor(private http: HttpClient) {}

  // Default (OpenAI)
  embedText(text: string) {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/openai`, { text })
    );
  }

  // Dynamic provider
  embedWithProvider(provider: 'openai' | 'nomic', text: string) {
    return firstValueFrom(
      this.http.post<any>(`${this.baseUrl}/${provider}`, { text })
    );
  }
}
