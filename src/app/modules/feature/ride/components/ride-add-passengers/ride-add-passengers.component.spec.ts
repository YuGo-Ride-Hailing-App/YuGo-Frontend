import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RideAddPassengersComponent } from './ride-add-passengers.component';

describe('RideAddPassengersComponent', () => {
  let component: RideAddPassengersComponent;
  let fixture: ComponentFixture<RideAddPassengersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RideAddPassengersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RideAddPassengersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
