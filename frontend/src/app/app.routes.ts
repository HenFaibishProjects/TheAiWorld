import { Routes } from '@angular/router';
import { CostSimulatorComponent } from './components/costs/costs';
import { PromptComponent } from './components/prompt/prompt';
import { VectorCompareComponent } from './components/vector-compare/vector-compare';
import { AiMenuComponent } from './components/ai-menu/ai-menu';
import { EmbeddingComponent } from './components/embedding/embedding.component';

export const routes: Routes = [
  {
    path: '',
    component: AiMenuComponent,
  },
  {
    path: 'costs',
    component: CostSimulatorComponent,
  },
  {
    path: 'prompt',
    component: PromptComponent,
  },
  {
    path: 'embedding',
    component: EmbeddingComponent,
  },
  {
    path: 'vector-compare',
    component: VectorCompareComponent,
  },
  {
    path: 'rag',
    component: VectorCompareComponent,
  },
];
