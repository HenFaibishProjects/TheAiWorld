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

    private readonly prompt = `
You are a strict AI assistant.

Rules:
- Answer ONLY using the provided context
- If the answer is not in the context, say "I don't know"
- Do NOT use prior knowledge
- Do NOT guess or infer

Context:
{context}

Question:
{question}

Answer:
`;

async createPrompt(context: string, question: string) {
  return this.prompt.replace('{context}', context).replace('{question}', question);
}

 async findSimilarFromText(text: string) {
  const { vector } = await this.openaiEmbeddingService.embedText(text);

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
  for (const text of texts) {
    const { vector } = await this.openaiEmbeddingService.embedText(text);

    await this.vectorRepo.save({
      content: text,
      embedding: vector,
    });
  }

  return { inserted: texts.length };
}

private buildContext(results: any[]): string {
  if (!results.length) {
    return '';
  }

  return results
    .map(r => `- ${r.v_content || r.content}`)
    .join('\n');
}

async askQuestion(question: string) {
  console.log('Question:', question);

  const embedding = await this.openaiEmbeddingService.embedText(question);
  const queryVector = embedding.vector;

  const formattedVector = `[${queryVector.join(',')}]`;

  const results = await this.vectorRepo
    .createQueryBuilder('v')
    .select(['v.content'])
    .addSelect('v.embedding <-> :vector', 'distance')
    .orderBy('distance', 'ASC')
    .limit(5)
    .setParameter('vector', formattedVector)
    .getRawMany();

  console.log('Results:', results);

  const context = this.buildContext(results);
  console.log('CONTEXT:');
  console.log(context);
  if (!context || context.trim().length === 0) {
  return "I don't know";
}
  const prompt = await this.createPrompt(context, question);
const aiResponse = await this.chatService.askOpenAI(prompt);
console.log('AI RESPONSE:', aiResponse); 
return aiResponse;
}
}