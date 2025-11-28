import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FtResponseDto } from './ft-response.dto';
import { FormsModule } from '@angular/forms';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-finetune',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finetune.html',
  styleUrl: './finetune.css',
})
export class Finetune {

  inputText = '';
  loading = false;
  error: string | null = null;
  result: FtResponseDto | null = null;
  private apiUrl = 'http://localhost:3000/ft';

  constructor(private http: HttpClient) {}

  send() {
    this.error = null;
    this.result = null;

    const trimmed = this.inputText.trim();
    if (!trimmed) {
      this.error = 'Please type some text first.';
      return;
    }

    this.loading = true;
    this.http
      .post<FtResponseDto>(this.apiUrl, { query: trimmed })
      .pipe(
        tap((response) => console.log('Response received:', response)),
        catchError((error) => {
          console.error('Error:', error);
          this.error = error?.error?.message || 'Request failed';
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          this.result = response;
          this.loading = false;
        },
        error: (error) => {
          this.error = error?.error?.message || 'Request failed';
          this.loading = false;
        }
      });
  }
}