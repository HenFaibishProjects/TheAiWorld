import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Embedding } from './embedding.component';

describe('Embedding', () => {
  let component: Embedding;
  let fixture: ComponentFixture<Embedding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Embedding]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Embedding);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
