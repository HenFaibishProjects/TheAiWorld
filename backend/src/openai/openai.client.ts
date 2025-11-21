export class OpenAIEmbeddingClient {
  constructor(private apiKey: string) {}

  async embed(text: string) {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-large",    // or "text-embedding-3-small"
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

  async explainSimilarity(word1: string, word2: string, similarityScore: number): Promise<string> {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are helping users understand semantic similarity scores. Explain in simple, plain English without technical jargon."
            },
            {
              role: "user",
              content: `Explain in 1-2 short sentences why "${word1}" and "${word2}" have a similarity score of ${(similarityScore * 100).toFixed(1)}%. Focus on their relationship and meaning. Do not mention cosine, vectors, embeddings, or models. Just explain why they are similar or different in simple terms.`
            }
          ],
          max_tokens: 100,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI Chat Error:', errorText);
        return "These words share some semantic meaning.";
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating similarity explanation:', error);
      return "These words share some semantic meaning.";
    }
  }
}
