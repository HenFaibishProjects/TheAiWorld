import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmbeddingService } from './embedding.service';
import { BackToHomeButtonComponent } from '../back-to-home-button/back-to-home-button';

@Component({
  selector: 'app-embedding',
  standalone: true,
  imports: [CommonModule, FormsModule, BackToHomeButtonComponent],
  templateUrl: './embedding.component.html',
  styleUrls: ['./embedding.component.css']
})
export class EmbeddingComponent {
  text = '';
  provider: 'openai' | 'nomic' = 'openai';
  loading = false;
  result: any = null;
  error: string | null = null;
  private toastTimeoutId: any = null;

  constructor(
    private embeddingService: EmbeddingService,
    private router: Router
  ) {}

  async generateEmbedding() {
    this.loading = true;
    this.result = null;
    this.error = null;

    try {
      console.log(`Generating embedding with provider: ${this.provider}`);
      this.result = await this.embeddingService.embedWithProvider(
        this.provider,
        this.text
      );
      console.log('Embedding result:', this.result);
    } catch (err: any) {
      console.error(err);
      this.showToast(err?.message || String(err) || 'Unknown error');
      this.result = null;
    } finally {
      this.loading = false;
    }
  }

  retry() {
    if (this.loading) return;
    if (!this.text || !this.text.trim()) {
      this.showToast('Please enter text to generate an embedding.');
      return;
    }
    this.generateEmbedding();
  }

  showToast(message: string, duration = 5000) {
    this.error = message;
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
    this.toastTimeoutId = setTimeout(() => {
      this.error = null;
      this.toastTimeoutId = null;
    }, duration);
  }

  dismissToast() {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
      this.toastTimeoutId = null;
    }
    this.error = null;
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
