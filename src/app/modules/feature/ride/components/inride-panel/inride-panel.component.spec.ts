import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InridePanelComponent } from './inride-panel.component';

describe('InridePanelComponent', () => {
  let component: InridePanelComponent;
  let fixture: ComponentFixture<InridePanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InridePanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InridePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
