import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanicCardComponent } from './panic-card.component';

describe('PanicCardComponent', () => {
  let component: PanicCardComponent;
  let fixture: ComponentFixture<PanicCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PanicCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanicCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
