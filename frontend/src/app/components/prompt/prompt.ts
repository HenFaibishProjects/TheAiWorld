import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatService } from '../../chat.service';
import { CostSimulatorComponent } from '../costs/costs';
import { BackToHomeButtonComponent } from '../back-to-home-button/back-to-home-button';
import type {
  ChatResponse,
  ModelInfo,
  AIProvider,
  ModelPricing,
  TokenUsage,
} from '../../models/chat.model';


@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [CommonModule, FormsModule, CostSimulatorComponent, BackToHomeButtonComponent],
  templateUrl: './prompt.html',
  styleUrls: ['./prompt.css']
})
export class PromptComponent implements OnInit {
  message = '';
  response: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  modelName = '';
  modelTemperature = 0;
  modelMaxTokens = 0;
  selectedProvider: AIProvider = 'claude';

  // Token usage tracking
  tokenUsage: TokenUsage | null = null;

  // Cost calculation
  modelPricing: Record<string, ModelPricing> = {
    'gpt4': { name: 'GPT-4', inputPrice: 0.03, outputPrice: 0.06 },
    'gpt4-turbo': { name: 'GPT-4 Turbo', inputPrice: 0.01, outputPrice: 0.03 },
    'gpt35': { name: 'GPT-3.5 Turbo', inputPrice: 0.0015, outputPrice: 0.002 },
    'claude-opus': { name: 'Claude 3 Opus', inputPrice: 0.015, outputPrice: 0.075 },
    'claude-sonnet': { name: 'Claude 3.5 Sonnet', inputPrice: 0.003, outputPrice: 0.015 },
    'claude-haiku': { name: 'Claude 3 Haiku', inputPrice: 0.00025, outputPrice: 0.00125 }
  };

  modelKeys: string[] = Object.keys(this.modelPricing);
  calculatedCosts: Record<string, number> = {};

  constructor(
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadModelInfo();
  }

  loadModelInfo(): void {
    this.chatService.getModelInfo(this.selectedProvider).subscribe({
      next: (info: ModelInfo) => {
        this.modelName = info.model || '';
        this.modelTemperature = info.temperature || 0;
        this.modelMaxTokens = info.maxTokens || 0;
      },
      error: (error) => {
        console.error('Error loading model info:', error);
        this.errorMessage = 'Failed to load model information';
      },
    });
  }

  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  send(): void {
    if (!this.message || !this.message.trim()) {
      this.errorMessage = 'Please enter a message';
      return;
    }

    this.isLoading = true;
    this.response = null;
    this.errorMessage = null;
    this.tokenUsage = null;

    this.chatService.send(this.message, this.selectedProvider).subscribe({
      next: (result: ChatResponse) => {
        console.log('Received result:', result);

        // Extract token usage
        this.tokenUsage = {
          prompt: result.promptTokens || 0,
          response: result.responseTokens || 0,
          total: result.totalTokens || 0,
        };

        // Handle error responses from backend
        if (result.error) {
          this.errorMessage = result.error;
          this.response = result.details || result.raw || 'No additional details';
        }
        // Format the structured response
        else if (result.subject && result['do the ai know the answer'] && result['the answer']) {
          this.response = `Subject: ${result.subject}\n\ndo the ai know the answer: ${result['do the ai know the answer']}\n\nThe answer: ${result['the answer']}`;
        }
        // Fallback to displaying the entire object as JSON
        else {
          this.response = JSON.stringify(result, null, 2);
        }

        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error sending message:', error);
        this.errorMessage = error.message || 'Failed to get response from AI';
        this.response = null;
        this.isLoading = false;
      },
    });
  }

  onProviderChange(): void {
    console.log('Provider changed to:', this.selectedProvider);
    this.errorMessage = null;
    // Reload model info from backend; do NOT modify `modelName` here so it remains
    // whatever the backend previously provided until the new info arrives.
    this.loadModelInfo();
  }

  getProviderLabel(): string {
    // Return a human-friendly provider label. If you want a clearer
    // hint when no modelName is available, include a small hint but do
    // not overwrite the actual `modelName` property.
    const label = this.selectedProvider === 'openai' ? 'OpenAI' : 'Claude';
    if (!this.modelName) {
      return `${label} (no model loaded)`;
    }
    return label;
  }

  getTokenPercentage(tokens: number): number {
    if (!this.tokenUsage || this.tokenUsage.total === 0) return 0;
    return (tokens / this.tokenUsage.total) * 100;
  }

  calculateCostForModel(modelKey: string): void {
    // Calculation moved to CostSimulatorComponent; parent no longer performs cost math here.
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
