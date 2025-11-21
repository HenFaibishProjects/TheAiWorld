# Semantic Similarity Score Interpretation Guide

## Your Implementation is Correct! ✅

The 54.95% similarity between "monitor" and "screen" is **expected and accurate**. This is not a bug - it's how semantic embeddings work.

## Understanding Semantic Similarity Scores

### What the Scores Actually Mean

Semantic similarity measures how closely related words are in **meaning across all contexts**, not just in your specific use case.

| Score Range | Interpretation | Examples |
|-------------|---------------|----------|
| **95-100%** | Identical or nearly identical | "monitor" vs "monitor" (100%) |
| **85-95%** | Extremely close synonyms | Very rare in practice |
| **70-85%** | Strong semantic relationship | Specific synonyms in context |
| **50-70%** | Related concepts, moderate connection | Most related words fall here |
| **30-50%** | Weakly related | Distant associations |
| **< 30%** | Unrelated concepts | Different domains |

### Why "Monitor" and "Screen" Score ~55%

From our diagnostic test results:

```
"monitor" vs "screen": 54.95%
"happy" vs "joyful": 57.39%
"car" vs "automobile": 54.31%
"cat" vs "dog": 59.07%
"computer" vs "laptop": 61.88%
```

**"Screen" is polysemic** (has multiple meanings):
- Computer/TV display ✓
- Movie projection screen
- Window screen (for insects)
- To screen/filter something (verb)
- Privacy screen
- Screen door
- Sunscreen

**"Monitor" is more specific**:
- Primarily refers to display devices
- Computer monitor
- Heart rate monitor (medical)

OpenAI's embeddings capture **all possible contexts and meanings**. Since "screen" has many meanings beyond computer displays, it has a lower similarity to the more specific "monitor".

## Real-World Test Results

Here are actual similarity scores from OpenAI's `text-embedding-3-large` model:

| Word Pair | Similarity | Notes |
|-----------|------------|-------|
| monitor ↔ monitor | 100.00% | Identical word |
| monitor ↔ screen | 54.95% | Related but polysemic |
| king ↔ queen | 55.52% | Related concepts |
| happy ↔ joyful | 57.39% | Strong synonyms |
| car ↔ automobile | 54.31% | Exact synonyms |
| cat ↔ dog | 59.07% | Both pets |
| apple ↔ orange | 45.88% | Both fruits |
| computer ↔ laptop | 61.88% | Type-of relationship |

## Why Not 95%?

**Semantic embeddings are context-independent**. They don't know you're specifically interested in:
- Computer displays
- Technology context
- A specific domain

They encode **all possible uses** of each word across:
- Literature
- Technical documents
- Casual conversation
- Historical texts
- Multiple languages
- All domains of knowledge

## What This Means for Your Application

### For General Semantic Search
- **50-70% is excellent** for related terms
- Use a threshold of **40-50%** to catch related concepts
- Don't expect 95% unless comparing identical or nearly identical terms

### For Domain-Specific Matching
If you need higher scores for domain-specific terms, consider:

1. **Add context to your queries**:
   ```
   "computer monitor" vs "computer screen" → Higher similarity
   "display monitor" vs "display screen" → Higher similarity
   ```

2. **Use fine-tuned embeddings** (if available for your domain)

3. **Implement custom scoring** that boosts scores for known synonym pairs in your domain

4. **Lower your threshold expectations**:
   - 50-60%: Strong relationship
   - 40-50%: Moderate relationship
   - 30-40%: Weak but potentially relevant

## Verification

The cosine similarity calculation in your code is **mathematically correct**:

```typescript
cosineSimilarity(a: number[], b: number[]): number {
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
```

✅ This implementation matches the standard formula  
✅ OpenAI embeddings are already normalized (magnitude = 1.0)  
✅ Results match expected behavior from OpenAI's embedding model

## Recommendations

1. **Don't change your calculation** - it's correct
2. **Adjust your expectations** - 50-60% is good for related terms
3. **Add context to improve scores** - use phrases instead of single words
4. **Update your UI** - show users what different score ranges mean
5. **Set appropriate thresholds** - 40-50% for most use cases

## References

- [OpenAI Embeddings Documentation](https://platform.openai.com/docs/guides/embeddings)
- [Cosine Similarity Explained](https://en.wikipedia.org/wiki/Cosine_similarity)
- Model used: `text-embedding-3-large` (3072 dimensions)
