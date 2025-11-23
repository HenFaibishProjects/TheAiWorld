export interface TokenUsage {
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
}

export interface ChatResponseDto {
  subject?: string;
  'what to seach in youtube'?: string;
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
