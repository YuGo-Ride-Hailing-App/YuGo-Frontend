import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerRegisterComponent } from './passenger-register.component';

describe('RegisterComponent', () => {
  let component: PassengerRegisterComponent;
  let fixture: ComponentFixture<PassengerRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PassengerRegisterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should doooo', () => {
    expect(true).toBeTruthy();
  });
});
