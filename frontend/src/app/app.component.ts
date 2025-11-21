import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmbeddingComponent } from './embedding/embedding.component';
import { ChatService } from './chat.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


interface ModelPricing {
  name: string;
  inputPricePerMTok: number;  // Price per million input tokens
  outputPricePerMTok: number; // Price per million output tokens
}

const MODEL_PRICING: { [key: string]: ModelPricing } = {
  'claude-3-5-haiku': {
    name: 'Claude 3.5 Haiku',
    inputPricePerMTok: 1.00,
    outputPricePerMTok: 5.00
  },
  'claude-3-5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    inputPricePerMTok: 3.00,
    outputPricePerMTok: 15.00
  },
  'gpt-4o': {
    name: 'GPT-4o',
    inputPricePerMTok: 2.50,
    outputPricePerMTok: 10.00
  },
  'gpt-4o-mini': {
    name: 'GPT-4o mini',
    inputPricePerMTok: 0.15,
    outputPricePerMTok: 0.60
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    inputPricePerMTok: 10.00,
    outputPricePerMTok: 30.00
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    inputPricePerMTok: 15.00,
    outputPricePerMTok: 75.00
  }
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, EmbeddingComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  message: string = '';
  response: string | null = null;
  promptTokens: number = 0;
  responseTokens: number = 0;
  totalTokens: number = 0;
  isLoading: boolean = false;
  modelName: string = '';
  modelTemperature: number = 0;
  modelMaxTokens: number = 0;
  modelPricing = MODEL_PRICING;
  modelKeys = Object.keys(MODEL_PRICING);
  calculatedCosts: { [key: string]: number } = {};
  selectedProvider: string = 'claude'; // Default to Claude

  // Word comparison properties
  word1: string = '';
  word2: string = '';
  comparingWords: boolean = false;
  comparisonResult: any = null;
  comparisonError: string = '';

  constructor(
    private chatService: ChatService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.chatService.getModelInfo().subscribe({
      next: (data: any) => {
        this.modelTemperature = data.temperature || 0;
        this.modelMaxTokens = data.maxTokens || 0;
      },
      error: (error) => {
        console.error("Error fetching model info:", error);
      }
    });
    
    // Set initial model name based on selected provider
    this.updateModelName();
  }

  onProviderChange() {
    this.updateModelName();
  }

  private updateModelName() {
    if (this.selectedProvider === 'openai') {
      this.modelName = 'gpt-4o-mini';
      console.log("Selected provider is OpenAI, setting model to gpt-4o-mini");
    } else if (this.selectedProvider === 'claude') {
      this.modelName = 'claude-3-5-haiku-20241022';
      console.log("Selected provider is Claude, setting model to claude-3-5-haiku-20241022");
    } else {
      console.warn("Unknown provider selected:", this.selectedProvider);
      this.modelName = 'claude-3-5-haiku-20241022';
    }
  }

  handleEnter(event: KeyboardEvent) {
    event.preventDefault();
    this.send();
  }

  send() {
    if (!this.message || !this.message.trim()) return;
    console.log("Sending message:", this.message);

    this.isLoading = true;
    const userMessage = this.message;

    this.chatService.send(userMessage, this.selectedProvider).subscribe({
      next: (data: any) => {
        console.log("✔ Received successful response from backend", data);
        
        // Extract token usage data
        this.promptTokens = data.promptTokens || 0;
        this.responseTokens = data.responseTokens || 0;
        this.totalTokens = data.totalTokens || 0;
        
        // Remove token fields from the data to display
        const { promptTokens, responseTokens, totalTokens, ...jsonContent } = data;
        console.log("Response content without tokens:", jsonContent);
        this.response = JSON.stringify(jsonContent, null, 2);
        
        // Clear previous cost calculations
        this.calculatedCosts = {};
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error:", error);
        this.response = "Error: " + error.message;
        this.isLoading = false;
      }
    });
  }

  calcCostUSD(
    promptTokens: number,
    responseTokens: number,
    inputPricePerMTok: number,
    outputPricePerMTok: number
  ): number {
    const inputCost = (promptTokens / 1_000_000) * inputPricePerMTok;
    const outputCost = (responseTokens / 1_000_000) * outputPricePerMTok;
    console.log(`Calculated cost - Input: $${inputCost.toFixed(6)}, Output: $${outputCost.toFixed(6)}`);
    return +(inputCost + outputCost).toFixed(6);
  }

  calculateCostForModel(modelKey: string): void {
    const pricing = this.modelPricing[modelKey];
    if (!pricing) return;

    const cost = this.calcCostUSD(
      this.promptTokens,
      this.responseTokens,
      pricing.inputPricePerMTok,
      pricing.outputPricePerMTok
    );
    console.log(`Total cost for model ${modelKey} (${pricing.name}): $${cost}`);
    this.calculatedCosts[modelKey] = cost;
  }

  // Word comparison methods
  compareWords() {
    if (!this.word1 || !this.word2 || this.comparingWords) return;

    this.comparingWords = true;
    this.comparisonError = '';
    this.comparisonResult = null;

    this.http.post('http://localhost:3000/embed/openai/compare', {
      word1: this.word1,
      word2: this.word2
    }).subscribe({
      next: (data: any) => {
        this.comparisonResult = data;
        this.comparingWords = false;
      },
      error: (error) => {
        this.comparisonError = 'Failed to compare words. Please try again.';
        this.comparingWords = false;
        console.error('Comparison error:', error);
      }
    });
  }

  getSimilarityColor(similarity: string): string {
    const percent = parseFloat(similarity);
    if (percent >= 80) return '#10b981'; // Green
    if (percent >= 60) return '#3b82f6'; // Blue
    if (percent >= 40) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  }

  getSimilarityDescription(similarity: string): string {
    const percent = parseFloat(similarity);
    if (percent == 100) return '🔥🔥🔥 identical meanings!';
    if (percent >= 90) return '🔥 Extremely similar - Almost identical meanings!';
    if (percent >= 80) return '✨ Very similar - Strong semantic connection';
    if (percent >= 70) return '👍 Similar - Clear relationship between words';
    if (percent >= 60) return '🤝 Somewhat similar - Moderate connection';
    if (percent >= 40) return '🤔 Slightly related - Weak connection';
    return '❌ Not similar - Very different meanings';
  }
}
