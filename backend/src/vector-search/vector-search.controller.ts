import { Controller, Get } from '@nestjs/common';
import { VectorSearchService } from './vector-search.service';
import { Public } from '../auth/public.decorator';
import { Post, Body } from '@nestjs/common';

@Controller('vector-search')
export class VectorSearchController {
  constructor(private readonly vectorSearchService: VectorSearchService) {}

  @Public()
  @Post('search')
  search(@Body('text') text: string) {
  return this.vectorSearchService.findSimilarFromText(text);
 }

@Public()
@Post('ask')
async ask(@Body('question') question: string) {
  return this.vectorSearchService.askQuestion(question);
}


@Public()
@Post('seed')
async seed() {
 const texts = [
  'Hen secret project is Project Falcon.',
  'Project Falcon is a confidential internal AI system.',
  'Project Falcon budget is 5 million dollars.',
  'Hen works in the AI research team.',
  'Only the internal AI research team has access to Project Falcon documents.',
  'Project Falcon is planned for internal release in December 2026.',
  'The codename Falcon should not be shared outside the company.',
  'Hen manager approved Project Falcon phase one.',
  'Project Falcon uses private retrieval data and internal evaluations.',
  'Hen is one of the backend engineers working on Project Falcon.',

  'Talia favorite restaurant is Green Basil in Petah Tikva.',
  'Daniel piano teacher is Ronit Cohen.',
  'Lia art class takes place every Tuesday at 17:00.',
  'The family vacation in August is planned for northern Italy.',
  'Hen home office room color is dark blue.',
  'The WiFi network name in Hen apartment is OneWifi.',
  'Hen preferred coffee is double espresso without sugar.',
  'The private parking spot number is 27.',
  'Hen personal laptop is a 16-inch model with 32GB RAM.',
  'The family emergency contact is saved under Toni Mobile.',

  'Project Atlas is handled by the finance systems group.',
  'Project Atlas budget is 2 million dollars.',
  'Project Neptune is owned by the cloud platform team.',
  'Project Neptune focuses on Kubernetes cost optimization.',
  'The internal analytics dashboard is called NorthStar.',
  'NorthStar is maintained by the data engineering team.',
  'The code freeze for Project Falcon starts on November 10 2026.',
  'Project Falcon depends on the vector search service.',
  'The vector search service stores document embeddings in PostgreSQL with pgvector.',
  'The internal AI gateway supports OpenAI and Anthropic providers.'
];

  return this.vectorSearchService.seedData(texts);
}
}