import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailListCardComponent } from './email-list-card.component';

describe('EmailListCardComponent', () => {
  let component: EmailListCardComponent;
  let fixture: ComponentFixture<EmailListCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailListCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailListCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
