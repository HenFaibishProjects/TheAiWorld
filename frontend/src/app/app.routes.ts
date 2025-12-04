import { Routes } from '@angular/router';
import { PromptComponent } from './components/prompt/prompt';
import { VectorCompareComponent } from './components/vector-compare/vector-compare';
import { AiMenuComponent } from './components/ai-menu/ai-menu';
import { EmbeddingComponent } from './components/embedding/embedding.component';
import { RagComponent } from './components/rag/rag.component';
import { Finetune } from './components/finetune/finetune';
import { LoginComponent } from './login/login';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
   {
    path: 'ai-menu',
    component: AiMenuComponent,
  },
  {
    path: 'fine-tuning',
    component: Finetune,
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
    component: RagComponent,
  },
   { path: 'login', component: LoginComponent },
];
