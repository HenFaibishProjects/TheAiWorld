import { Injectable } from '@nestjs/common';

/**
 * Utility service for vector math operations such as
 * cosine similarity, normalization, and preview.
 */
@Injectable()
export class VectorUtilsService {

  /**
   * Computes the cosine similarity between two vectors.
   * Returns a float between -1 and 1.
   */
  cosineSimilarity(a: number[], b: number[]): number {
    this.ensureSameLength(a, b);

    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }

    const denominator = Math.sqrt(magA) * Math.sqrt(magB);
    if (denominator === 0) return 0;

    return dot / denominator;
  }

  /**
   * Normalizes a vector to unit length.
   * Useful but optional for similarity checks.
   */
  normalize(vec: number[]): number[] {
    const magnitude = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    return magnitude === 0 ? vec : vec.map(v => v / magnitude);
  }

  /**
   * Returns a shortened preview of a vector (first 5 values)
   * rounded to 4 decimals for readability.
   */
  preview(vec: number[]): number[] {
    return vec.slice(0, 5).map(v => Number(v.toFixed(4)));
  }

  /**
   * Ensures that two vectors have the same length.
   * Throws a clear error if not.
   */
  private ensureSameLength(a: number[], b: number[]) {
    if (a.length !== b.length) {
      throw new Error(
        `Vector length mismatch: ${a.length} vs ${b.length}`
      );
    }
  }
}
