import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}

  getModelInfo() {
    console.log("Fetching model info from backend");
    return this.http.get('http://localhost:3000/chat/model');
  }

  send(message: string, provider: string) {
    console.log(`Sending message to backend with provider: ${provider}`);
    return this.http.post('http://localhost:3000/chat', { message, provider });
  }
}
