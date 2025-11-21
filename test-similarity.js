// Quick test to verify cosine similarity calculation
function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vector length mismatch');
  }

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

// Test with sample vectors
const vec1 = [1, 2, 3, 4, 5];
const vec2 = [1, 2, 3, 4, 5]; // Identical
const vec3 = [5, 4, 3, 2, 1]; // Reversed
const vec4 = [2, 3, 4, 5, 6]; // Similar direction

console.log('Identical vectors:', (cosineSimilarity(vec1, vec2) * 100).toFixed(2) + '%');
console.log('Reversed vectors:', (cosineSimilarity(vec1, vec3) * 100).toFixed(2) + '%');
console.log('Similar vectors:', (cosineSimilarity(vec1, vec4) * 100).toFixed(2) + '%');

// Expected results:
// - Identical: 100%
// - Reversed: Lower score (still positive due to positive values)
// - Similar: High score (similar direction)
