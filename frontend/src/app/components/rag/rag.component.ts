import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RagService, RagResponse, RagAnswerDetail } from './rag.service';
import { BackToHomeButtonComponent } from '../back-to-home-button/back-to-home-button';

// Add this interface for conversation items
interface ConversationItem {
  query: string;
  answerDetail: RagAnswerDetail;
  timestamp: Date;
  showJSON: boolean;
}

@Component({
  selector: 'app-rag',
  standalone: true,
  imports: [CommonModule, FormsModule, BackToHomeButtonComponent],
  templateUrl: './rag.component.html',
  styleUrls: ['./rag.component.css']
})
export class RagComponent {
  query = '';
  response: RagResponse | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  conversationHistory: ConversationItem[] = []; // Updated type

  constructor(private ragService: RagService) {}

  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.ask();
    }
  }

  ask(): void {
    if (!this.query || !this.query.trim()) {
      this.errorMessage = 'Please enter a question';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const currentQuery = this.query;

    this.ragService.query(this.query).subscribe({
      next: (result: RagResponse) => {
        this.response = result;
        this.conversationHistory.unshift({
          query: currentQuery,
          answerDetail: result.answer,
          timestamp: new Date(),
          showJSON: false // Initialize showJSON as false
        });
        this.isLoading = false;
        this.query = '';
      },
      error: (error: Error) => {
        console.error('Error querying RAG:', error);
        this.errorMessage = error.message || 'Failed to get response from RAG system';
        this.response = null;
        this.isLoading = false;
      },
    });
  }

  clearHistory(): void {
    this.conversationHistory = [];
    this.response = null;
    this.errorMessage = null;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard');
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // New method to format JSON
  formatJSON(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }
}