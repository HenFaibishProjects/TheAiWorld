export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
}

export interface ChatResponseDto {
  answer?: string;
  subject?: string;
  error?: string;
  raw?: string;
  details?: string;
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
}

export interface ModelInfoDto {
  model: string;
  temperature: number;
  maxTokens: number;
}
