import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VectorEntity } from './dto/vector.entity';
import { Repository } from 'typeorm';
import { OpenAIEmbeddingService } from '../openai/openai-embedding.service';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class VectorSearchService {
    constructor(
    @InjectRepository(VectorEntity)
    private readonly vectorRepo: Repository<VectorEntity>,
    private readonly openaiEmbeddingService: OpenAIEmbeddingService,
    private readonly chatService: ChatService,
    ) {}
    private readonly DISTANCE_DELTA = 0.15;
    private readonly prompt = `
You are a strict AI assistant.

Rules:
- Answer ONLY using the provided context
- If the answer is not in the context, say "I don't know"
- Do NOT use prior knowledge
- Use ONLY the provided context.
You may summarize or combine information from the context to form the answer.

Context:
{context}

Question:
{question}

Respond ONLY in JSON format:

{
  "answer": string
}

The "answer" must be based ONLY on the provided context.
If the context contains the answer, extract and summarize it.
If the context does NOT contain the answer, return:

{
  "answer": "I don't know"
}
`;

async createPrompt(context: string, question: string) {
  return this.prompt.replace('{context}', context).replace('{question}', question);
}

 async findSimilarFromText(text: string) {
  let vector;
  try {
    const embedding = await this.openaiEmbeddingService.embedText(text);
    vector = embedding.vector;
  } catch (error) {
    console.error('Embedding failed:', error);
    return [];
  }

  return this.vectorRepo
    .createQueryBuilder('vector')
    .select([
      'vector.content',
      "vector.embedding <-> :embedding AS distance",
    ])
    .setParameter('embedding', `[${vector.join(',')}]`)
    .orderBy('distance', 'ASC')
    .limit(3)
    .getRawMany();
}

 async seedData(texts: string[]) {
  let success = 0;
  let failed = 0;

  for (const text of texts) {
    try {
      const { vector } = await this.openaiEmbeddingService.embedText(text);

      await this.vectorRepo.save({
        content: text,
        embedding: vector,
      });

      success++;
    } catch (error) {
      console.error('Seed failed for text:', text);
      failed++;
    }
  }

  return { inserted: success, failed };
}

private buildContext(results: any[]): string {
  if (!results.length) {
    return '';
  }

  return results
  .slice(0, 3)
  .map(r => r.v_content || r.content)
  .join('. ');
}

private isEmptyContext(context: string): boolean {
  return !context || context.trim().length === 0;
}

private async findClosestVectors(formattedVector: string) {
  return this.vectorRepo
    .createQueryBuilder('v')
    .select(['v.content'])
    .addSelect('v.embedding <-> :vector', 'distance')
    .orderBy('distance', 'ASC')
    .limit(3)
    .setParameter('vector', formattedVector)
    .getRawMany();
}

private async createQueryVector(question: string): Promise<string> {
  const embedding = await this.openaiEmbeddingService.embedText(question);
  const vector = embedding.vector;

  return `[${vector.join(',')}]`;
}

private evaluateResults(results: any[]): { filteredResults: any[]; shouldStop: boolean } {
  if (!results.length) {
    return { filteredResults: [], shouldStop: true };
  }

  const bestDistance = Number(results[0]?.distance);

  // early stop if no good results
  if (bestDistance > 1.1) {
    return { filteredResults: [], shouldStop: true };
  }

  // filter by best distance
  const filteredResults = results.filter(r => {
    const distance = Number(r.distance);
    return distance <= bestDistance + this.DISTANCE_DELTA;
  });

  // confidence by count of results
  const confidence = filteredResults.length >= 2;

  // distances
  const distances = filteredResults.map(r => Number(r.distance));

  // spread
  const spread = Math.max(...distances) - Math.min(...distances);

  const isTightCluster = spread < 0.2;

  const finalConfidence = confidence && isTightCluster;

  return {
    filteredResults,
    shouldStop: !finalConfidence,
  };
}

async askQuestion(question: string) {
  const startTime = Date.now();
 const formattedVector = await this.createQueryVector(question);
 const results = await this.findClosestVectors(formattedVector);
 const { filteredResults, shouldStop } = this.evaluateResults(results);
    if (shouldStop) {
      return {
      answer: "I don't know",
      results: [],
    };
  }
  const context = this.buildContext(filteredResults);
if (this.isEmptyContext(context)) {
 return {
  answer: "I don't know",
  results: [],
};
}
const prompt = await this.createPrompt(context, question);
const aiResponse = await this.chatService.askOpenAI(prompt);
console.log('RAW AI RESPONSE:', aiResponse);
const latency = Date.now() - startTime;
return {
  answer: aiResponse?.answer || aiResponse?.['the answer'] || "I don't know",
  results: results.map(r => ({
    content: r.v_content || r.content,
    distance: Number(r.distance),
  })),
  debug: {
    question,
    chunksSent: filteredResults.length,
    tokens: {
            prompt: aiResponse?.promptTokens,
            response: aiResponse?.responseTokens,
            total: aiResponse?.totalTokens,
},
    latencyMs: latency,
  },
};
  } 
}