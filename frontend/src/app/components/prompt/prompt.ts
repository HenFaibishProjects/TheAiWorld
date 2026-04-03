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

modelPricing: Record<string, ModelPricing> = {
  // OpenAI - GPT-5.4 family (current flagship)
  'gpt-5.4-pro':    { name: 'GPT-5.4 Pro',    inputPrice: 30.00,  outputPrice: 180.00 },
  'gpt-5.4':        { name: 'GPT-5.4',         inputPrice: 2.50,   outputPrice: 15.00  },
  'gpt-5.4-mini':   { name: 'GPT-5.4 Mini',    inputPrice: 0.75,   outputPrice: 4.50   },
  'gpt-5.4-nano':   { name: 'GPT-5.4 Nano',    inputPrice: 0.20,   outputPrice: 1.25   },

  // OpenAI - GPT-5 family (previous gen, still available)
  'gpt-5':          { name: 'GPT-5',           inputPrice: 1.25,   outputPrice: 10.00  },
  'gpt-5-mini':     { name: 'GPT-5 Mini',      inputPrice: 0.25,   outputPrice: 2.00   },
  'gpt-5-nano':     { name: 'GPT-5 Nano',      inputPrice: 0.05,   outputPrice: 0.40   },
  'gpt-5.2':        { name: 'GPT-5.2',         inputPrice: 1.75,   outputPrice: 14.00  },

  // OpenAI - GPT-4 family (legacy, still available)
  'gpt-4.1':        { name: 'GPT-4.1',         inputPrice: 2.00,   outputPrice: 8.00   },
  'gpt-4.1-mini':   { name: 'GPT-4.1 Mini',    inputPrice: 0.40,   outputPrice: 1.60   },
  'gpt-4.1-nano':   { name: 'GPT-4.1 Nano',    inputPrice: 0.10,   outputPrice: 0.40   },
  'gpt-4o':         { name: 'GPT-4o',          inputPrice: 2.50,   outputPrice: 10.00  },
  'gpt-4o-mini':    { name: 'GPT-4o Mini',     inputPrice: 0.15,   outputPrice: 0.60   },

  // Anthropic - Claude 4.6 family (current)
  'claude-sonnet-4-6': { name: 'Claude Sonnet 4.6', inputPrice: 3.00,  outputPrice: 15.00 },
  'claude-opus-4-6':   { name: 'Claude Opus 4.6',   inputPrice: 5.00,  outputPrice: 25.00 },

  // Anthropic - Claude 4.5 family
  'claude-sonnet-4-5': { name: 'Claude Sonnet 4.5', inputPrice: 3.00,  outputPrice: 15.00 },
  'claude-haiku-4-5':  { name: 'Claude Haiku 4.5',  inputPrice: 1.00,  outputPrice: 5.00  },

  // Anthropic - Claude legacy
  'claude-opus-4-1':   { name: 'Claude Opus 4.1',   inputPrice: 15.00, outputPrice: 75.00 },

  // Google - Gemini 3.x family (current)
  'gemini-3.1-pro':    { name: 'Gemini 3.1 Pro',    inputPrice: 1.25,  outputPrice: 10.00 },
  'gemini-3-flash':    { name: 'Gemini 3 Flash',     inputPrice: 0.50,  outputPrice: 3.00  },

  // Google - Gemini 2.5 family (previous gen, still available)
  'gemini-2.5-pro':    { name: 'Gemini 2.5 Pro',    inputPrice: 1.25,  outputPrice: 10.00 },
  'gemini-2.5-flash':  { name: 'Gemini 2.5 Flash',  inputPrice: 0.15,  outputPrice: 0.60  },
  'gemini-2.5-flash-lite': { name: 'Gemini 2.5 Flash-Lite', inputPrice: 0.075, outputPrice: 0.30 },

  // xAI - Grok family
  'grok-4':            { name: 'Grok 4',            inputPrice: 3.00,  outputPrice: 15.00 },
  'grok-4-fast':       { name: 'Grok 4 Fast',       inputPrice: 0.20,  outputPrice: 0.50  },
  'grok-3':            { name: 'Grok 3',            inputPrice: 3.00,  outputPrice: 15.00 },
  'grok-3-mini':       { name: 'Grok 3 Mini',       inputPrice: 0.30,  outputPrice: 0.50  },

  // DeepSeek (current available models)
  'deepseek-v3.2':     { name: 'DeepSeek V3.2',     inputPrice: 0.28,  outputPrice: 0.42  },
  'deepseek-r1':       { name: 'DeepSeek R1',       inputPrice: 0.55,  outputPrice: 2.19  },

  // Meta - Llama 4 (hosted, e.g. via Together/Fireworks)
  'llama-4-maverick':  { name: 'Llama 4 Maverick',  inputPrice: 0.27,  outputPrice: 0.85  },
  'llama-4-scout':     { name: 'Llama 4 Scout',     inputPrice: 0.10,  outputPrice: 0.30  },

  // Mistral
  'mistral-small':     { name: 'Mistral Small',     inputPrice: 0.20,  outputPrice: 0.60  },
  'mistral-large':     { name: 'Mistral Large',     inputPrice: 2.00,  outputPrice: 6.00  },
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
    let label = 'Unknown';
    if (this.selectedProvider === 'openai') label = 'OpenAI';
    else if (this.selectedProvider === 'claude') label = 'Claude';
    else if (this.selectedProvider === 'deepseek') label = 'DeepSeek';

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
