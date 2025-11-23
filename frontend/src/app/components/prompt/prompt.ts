import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../chat.service';
import { CostSimulatorComponent } from '../costs/costs';

@Component({
  selector: 'app-prompt',
  standalone: true,
  imports: [CommonModule, FormsModule, CostSimulatorComponent],
  templateUrl: './prompt.html',
  styleUrls: ['./prompt.css']
})
export class PromptComponent implements OnInit {
  message: string = '';
  response: string | null = null;
  isLoading: boolean = false;
  modelName: string = '';
  modelTemperature: number = 0;
  modelMaxTokens: number = 0;
  selectedProvider: string = 'claude';
  
  // Token usage tracking
  tokenUsage: {
    prompt: number;
    response: number;
    total: number;
  } | null = null;

  // Cost calculation
  modelPricing: any = {
    'gpt4': { name: 'GPT-4', inputPrice: 0.03, outputPrice: 0.06 },
    'gpt4-turbo': { name: 'GPT-4 Turbo', inputPrice: 0.01, outputPrice: 0.03 },
    'gpt35': { name: 'GPT-3.5 Turbo', inputPrice: 0.0015, outputPrice: 0.002 },
    'claude-opus': { name: 'Claude 3 Opus', inputPrice: 0.015, outputPrice: 0.075 },
    'claude-sonnet': { name: 'Claude 3.5 Sonnet', inputPrice: 0.003, outputPrice: 0.015 },
    'claude-haiku': { name: 'Claude 3 Haiku', inputPrice: 0.00025, outputPrice: 0.00125 }
  };
  
  modelKeys: string[] = Object.keys(this.modelPricing);
  calculatedCosts: { [key: string]: number } = {};

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.loadModelInfo();
  }

  loadModelInfo() {
    this.chatService.getModelInfo().subscribe({
      next: (info: any) => {
        this.modelName = info.name || '';
        this.modelTemperature = info.temperature || 0;
        this.modelMaxTokens = info.maxTokens || 0;
      },
      error: (error) => {
        console.error('Error loading model info:', error);
      }
    });
  }

  handleEnter(event: any) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  send() {
    if (!this.message || !this.message.trim()) {
      return;
    }

    this.isLoading = true;
    this.response = null;
    this.tokenUsage = null;

    this.chatService.send(this.message, this.selectedProvider).subscribe({
      next: (result: any) => {
        console.log('Received result:', result);
        
        // Extract token usage
        this.tokenUsage = {
          prompt: result.promptTokens || 0,
          response: result.responseTokens || 0,
          total: result.totalTokens || 0
        };
        
        // Handle error responses from backend
        if (result.error) {
          this.response = `Error: ${result.error}\n${result.details || result.raw || ''}`;
        }
        // Format the structured response
        else if (result.subject && result['what to seach in youtube']) {
          this.response = `Subject: ${result.subject}\n\nYouTube Search: ${result['what to seach in youtube']}`;
        }
        // Fallback to displaying the entire object as JSON
        else {
          this.response = JSON.stringify(result, null, 2);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.response = 'Error: Failed to get response from AI';
        this.isLoading = false;
      }
    });
  }

  onProviderChange() {
    console.log('Provider changed to:', this.selectedProvider);
    this.loadModelInfo();
  }

  getTokenPercentage(tokens: number): number {
    if (!this.tokenUsage || this.tokenUsage.total === 0) return 0;
    return (tokens / this.tokenUsage.total) * 100;
  }

  calculateCostForModel(modelKey: string) {
    // Calculation moved to CostSimulatorComponent; parent no longer performs cost math here.
  }
}
