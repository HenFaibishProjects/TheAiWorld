import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmbeddingService } from './embedding.service';

@Component({
  selector: 'app-embedding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './embedding.component.html',
  styleUrls: ['./embedding.component.css']
})
export class EmbeddingComponent {
  text = '';
  provider: 'openai' | 'nomic' = 'openai';
  loading = false;
  result: any = null;

  constructor(private embeddingService: EmbeddingService) {}

  async generateEmbedding() {
    this.loading = true;
    this.result = null;

    try {
      console.log(`Generating embedding with provider: ${this.provider}`);
      this.result = await this.embeddingService.embedWithProvider(
        this.provider,
        this.text
      );
      console.log('Embedding result:', this.result);
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
}
