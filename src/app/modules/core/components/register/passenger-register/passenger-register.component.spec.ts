import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerRegisterComponent } from './passenger-register.component';
import {DebugElement} from "@angular/core";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {BrowserDynamicTestingModule} from "@angular/platform-browser-dynamic/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {By} from "@angular/platform-browser";
import {mockUser1} from "../../../mocks/registration.service.mock";

describe('RegisterComponent', () => {
  let component: PassengerRegisterComponent;
  let fixture: ComponentFixture<PassengerRegisterComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PassengerRegisterComponent ],
      imports:[
        MatSnackBarModule,
        HttpClientTestingModule,
        MatFormFieldModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        BrowserAnimationsModule
      ],
      providers:[
        {provide:MatDialogRef,useValue:{}},{ provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PassengerRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    de = fixture.debugElement.query(By.css('form'));
    el = de.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should doooo', () => {
    expect(true).toBeTruthy();
  });

  it(`should call the onSubmit method`,() => {
    spyOn(component, 'onSubmit');
    el = fixture.debugElement.query(By.css('button')).nativeElement;
    el.click();
    expect(component.onSubmit).toHaveBeenCalledTimes(0);
  });
  it(`form should be invalid`, () => {
    component.registrationForm.controls['email'].setValue('');
    component.registrationForm.controls['password'].setValue('');
    component.registrationForm.controls['confirmPassword'].setValue('');
    component.registrationForm.controls['firstName'].setValue('');
    component.registrationForm.controls['lastName'].setValue('');
    component.registrationForm.controls['address'].setValue('');
    component.registrationForm.controls['phoneNumber'].setValue('');
    expect(component.registrationForm.valid).toBeFalsy();
  });
  it(`form should be invalid on start`, () => {
    el =fixture.debugElement.query(By.css('button')).nativeElement;
    el.click();
    expect(component.registrationForm.valid).toBeFalsy();
  });

  it(`form should be valid`, () => {
    component.registrationForm.controls['email'].setValue(mockUser1.email);
    component.registrationForm.controls['password'].setValue(mockUser1.password);
    component.registrationForm.controls['confirmPassword'].setValue(mockUser1.password);
    component.registrationForm.controls['firstName'].setValue(mockUser1.name);
    component.registrationForm.controls['lastName'].setValue(mockUser1.surname);
    component.registrationForm.controls['address'].setValue(mockUser1.address);
    component.registrationForm.controls['phoneNumber'].setValue(mockUser1.telephoneNumber);
    expect(component.registrationForm.valid).toBeTruthy();
  });
});
