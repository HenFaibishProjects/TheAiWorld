export interface TokenUsage {
  prompt: number;
  response: number;
  total: number;
}

export interface ChatResponse {
  subject?: string;
  'what to seach in youtube'?: string;
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
