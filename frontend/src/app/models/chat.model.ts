export interface TokenUsage {
  prompt: number;
  response: number;
  total: number;
}

export interface ChatResponse {
  subject?: string;
  'do the ai know the answer'?: string;
  'the answer'?: string;
  error?: string;
  raw?: string;
  details?: string;
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
}

export interface ModelInfo {
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ModelPricing {
  name: string;
  inputPrice: number;
  outputPrice: number;
}

export type AIProvider = 'openai' | 'claude';

export interface ChatRequest {
  message: string;
  provider: AIProvider;
}
