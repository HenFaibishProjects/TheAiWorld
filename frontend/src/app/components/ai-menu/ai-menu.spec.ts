import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiMenu } from './ai-menu';

describe('AiMenu', () => {
  let component: AiMenu;
  let fixture: ComponentFixture<AiMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
