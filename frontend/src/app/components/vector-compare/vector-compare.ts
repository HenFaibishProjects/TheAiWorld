import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BackToHomeButtonComponent } from '../back-to-home-button/back-to-home-button';


@Component({
  selector: 'app-vector-compare',
  standalone: true,
  imports: [CommonModule, FormsModule, BackToHomeButtonComponent],
  templateUrl: './vector-compare.component.html',
  styleUrls: ['./vector-compare.component.css']
})
export class VectorCompareComponent {
  comparisonError: string = '';
  comparingWords: boolean = false;
  comparisonResult: any = null;
  word1: string = '';
  word2: string = '';

  constructor(private http: HttpClient) {}

  compareWords() {
    if (!this.word1 || !this.word2 || this.comparingWords) return;

    this.comparingWords = true;
    this.comparisonError = '';
    this.comparisonResult = null;

    this.http.post('https://theaiworld.onrender.com/embed/openai/compare', {
      word1: this.word1,
      word2: this.word2
    }).subscribe({
      next: (data: any) => {
        this.comparisonResult = data;
        this.comparingWords = false;
      },
      error: (error) => {
        this.comparisonError = 'Failed to compare words. Please try again.';
        this.comparingWords = false;
        console.error('Comparison error:', error);
      }
    });
  }

  getSimilarityColor(similarity: string): string {
    const percent = parseFloat(similarity);
    if (percent >= 80) return '#10b981'; // Green
    if (percent >= 60) return '#3b82f6'; // Blue
    if (percent >= 40) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  }

  getSimilarityDescription(similarity: string): string {
    const percent = parseFloat(similarity);
    if (percent == 100) return '🔥🔥🔥 identical meanings!';
    if (percent >= 90) return '🔥 Extremely similar - Almost identical meanings!';
    if (percent >= 80) return '✨ Very similar - Strong semantic connection';
    if (percent >= 70) return '👍 Similar - Clear relationship between words';
    if (percent >= 60) return '🤝 Somewhat similar - Moderate connection';
    if (percent >= 40) return '🤔 Slightly related - Weak connection';
    return '❌ Not similar - Very different meanings';
  }
}
