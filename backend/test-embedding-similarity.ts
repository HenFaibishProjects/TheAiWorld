/**
 * Diagnostic script to test OpenAI embeddings and cosine similarity
 * This will help identify if the issue is with the calculation or the embeddings
 */

import * as dotenv from 'dotenv';

// Load .env file
dotenv.config();

async function testEmbeddingSimilarity() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('Error: OPENAI_API_KEY not found in environment');
    process.exit(1);
  }

  // Cosine similarity function (same as in the service)
  function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error(`Vector length mismatch: ${a.length} vs ${b.length}`);
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

  // Get embedding from OpenAI
  async function getEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-large',
        input: text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Error: ${errorText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  // Test cases
  const testPairs = [
    ['monitor', 'screen'],
    ['monitor', 'monitor'],  // Identical - should be 100%
    ['king', 'queen'],       // Related concepts
    ['happy', 'joyful'],     // Synonyms
    ['car', 'automobile'],   // Exact synonyms
    ['cat', 'dog'],          // Related but different
    ['apple', 'orange'],     // Both fruits
    ['computer', 'laptop'],  // Related technology
  ];

  console.log('Testing OpenAI Embeddings and Cosine Similarity\n');
  console.log('='.repeat(60));

  for (const [word1, word2] of testPairs) {
    try {
      console.log(`\nComparing: "${word1}" vs "${word2}"`);
      
      const vec1 = await getEmbedding(word1);
      const vec2 = await getEmbedding(word2);
      
      console.log(`  Vector dimensions: ${vec1.length}`);
      
      // Check if vectors are normalized
      const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
      const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
      console.log(`  Vector magnitudes: ${mag1.toFixed(6)}, ${mag2.toFixed(6)}`);
      
      const similarity = cosineSimilarity(vec1, vec2);
      const percentage = (similarity * 100).toFixed(2);
      
      console.log(`  Cosine Similarity: ${similarity.toFixed(6)} (${percentage}%)`);
      
      // Show first few values of each vector
      console.log(`  "${word1}" preview: [${vec1.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
      console.log(`  "${word2}" preview: [${vec2.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
      
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\nINTERPRETATION GUIDE:');
  console.log('  95-100%: Identical or extremely similar (same word/exact synonyms)');
  console.log('  85-95%:  Very similar (close synonyms)');
  console.log('  70-85%:  Related concepts, strong semantic connection');
  console.log('  50-70%:  Somewhat related, moderate semantic connection');
  console.log('  <50%:    Weakly related or unrelated');
  console.log('\nNOTE: "monitor" and "screen" at 50-60% is NORMAL because:');
  console.log('  - They are related but not exact synonyms');
  console.log('  - "screen" has multiple meanings (display, filter, projection, etc.)');
  console.log('  - "monitor" is more specific to display devices');
}

// Run the test
testEmbeddingSimilarity().catch(console.error);
