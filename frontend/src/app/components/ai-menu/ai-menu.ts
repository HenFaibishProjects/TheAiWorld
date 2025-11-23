import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface MenuItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  gradient: string;
}

@Component({
  selector: 'app-ai-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ai-menu.html',
  styleUrls: ['./ai-menu.css']
})
export class AiMenuComponent {
  menuItems: MenuItem[] = [
    {
      id: 1,
      title: 'Costs',
      description: 'Manage and analyze AI operation costs',
      icon: '💰',
      route: '/costs',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      id: 2,
      title: 'Prompt',
      description: 'Create and test AI prompts',
      icon: '✨',
      route: '/prompt',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    {
      id: 3,
      title: 'RAG',
      description: 'Retrieval Augmented Generation system',
      icon: '🔍',
      route: '/rag',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    {
      id: 4,
      title: 'Fine Tuning',
      description: 'Train and optimize AI models',
      icon: '⚙️',
      route: '/fine-tuning',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      id: 5,
      title: 'Vector Embedding',
      description: 'Convert data to vector representations',
      icon: '🧬',
      route: '/vector-embedding',
      color: '#ec4899',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  onCardHover(event: MouseEvent, item: MenuItem): void {
    const card = event.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }
}
