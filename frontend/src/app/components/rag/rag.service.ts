import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RagAnswerDetail {
  answer: string;
  fromData: boolean;
  fromAI: boolean;
  tokens: number;
}

export interface RagResponse {
  query: string;
  answer: RagAnswerDetail;
}

@Injectable({
  providedIn: 'root'
})
export class RagService {
  private apiUrl = 'https://theaiworld.onrender.com/rag';

  constructor(private http: HttpClient) {}

  query(question: string): Observable<RagResponse> {
    return this.http.get<RagResponse>(this.apiUrl, {
      params: { q: question }
    });
  }
}
