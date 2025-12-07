import { Routes } from '@angular/router';
import { PromptComponent } from './components/prompt/prompt';
import { VectorCompareComponent } from './components/vector-compare/vector-compare';
import { AiMenuComponent } from './components/ai-menu/ai-menu';
import { EmbeddingComponent } from './components/embedding/embedding.component';
import { RagComponent } from './components/rag/rag.component';
import { RagUploadComponent } from './components/rag/rag-upload.component';
import { Finetune } from './components/finetune/finetune';
import { LoginComponent } from './login/login';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/ai-menu',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'ai-menu',
    component: AiMenuComponent,
    canActivate: [authGuard]
  },
  {
    path: 'fine-tuning',
    component: Finetune,
    canActivate: [authGuard]
  },
  {
    path: 'prompt',
    component: PromptComponent,
    canActivate: [authGuard]
  },
  {
    path: 'embedding',
    component: EmbeddingComponent,
    canActivate: [authGuard]
  },
  {
    path: 'vector-compare',
    component: VectorCompareComponent,
    canActivate: [authGuard]
  },
  {
    path: 'rag',
    component: RagComponent,
    canActivate: [authGuard]
  },
  {
    path: 'rag-upload',
    component: RagUploadComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
