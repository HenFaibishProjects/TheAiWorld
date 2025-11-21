import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VectorCompareService } from './vector-compare.service';

interface ComparisonResult {
  pair: string;
  similarityPercent: string;
  similarityExplanation?: string;
  vector1Preview: number[];
  vector2Preview: number[];
}

@Component({
  selector: 'app-vector-compare',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vector-compare.component.html',
  styleUrls: ['./vector-compare.component.css']
})
export class VectorCompareComponent {
  loading = false;
  result: ComparisonResult | null = null;
  error: string | null = null;

  constructor(private vectorCompareService: VectorCompareService) {}

  compareVectors() {
    this.loading = true;
    this.error = null;
    this.result = null;

    this.vectorCompareService.compareDogCat().subscribe({
      next: (data) => {
        this.result = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to compare vectors. Please check if the backend is running and vector files exist.';
        this.loading = false;
        console.error('Error comparing vectors:', err);
      }
    });
  }

  getSimilarityColor(): string {
    if (!this.result) return '#6c757d';
    
    const percent = parseFloat(this.result.similarityPercent);
    if (percent >= 95) return '#10b981';
    if (percent >= 70) return '#3b82f6';
    if (percent >= 50) return '#f59e0b';
    return '#ef4444';
  }

  isScoreInRange(min: number, max: number): boolean {
    if (!this.result) return false;
    const percent = parseFloat(this.result.similarityPercent);
    return percent >= min && percent < max;
  }
}
