import { Injectable } from '@nestjs/common';

@Injectable()
export class NomicClient {
  constructor(private apiKey: string) {}

  async embed(text: string) {
    const response = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.VOYAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "voyage-3",
        input: [text]
      })
    });

    const data = await response.json();

    return data.data[0].embedding;
  }
}
