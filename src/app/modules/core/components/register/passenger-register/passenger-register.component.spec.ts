import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassengerRegisterComponent } from './passenger-register.component';
import {DebugElement} from "@angular/core";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
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
        {provide:MatDialogRef,useValue:{}},
        {provide: MAT_DIALOG_DATA, useValue: {}}
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

  it(`should call the onSubmit method`,() => {
    spyOn(component, 'onSubmit');
    el = fixture.debugElement.query(By.css('button')).nativeElement;
    el.click();
    expect(component.onSubmit).toHaveBeenCalledTimes(0);
  });

  it(`form should be invalid on start`, () => {
    el = fixture.debugElement.query(By.css('button')).nativeElement;
    el.click();
    expect(component.registrationForm.valid).toBeFalsy();
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

  function fillForm(){
    component.registrationForm.controls['email'].setValue(mockUser1.email);
    component.registrationForm.controls['password'].setValue(mockUser1.password);
    component.registrationForm.controls['confirmPassword'].setValue(mockUser1.password);
    component.registrationForm.controls['firstName'].setValue(mockUser1.name);
    component.registrationForm.controls['lastName'].setValue(mockUser1.surname);
    component.registrationForm.controls['address'].setValue(mockUser1.address);
    component.registrationForm.controls['phoneNumber'].setValue(mockUser1.telephoneNumber);
  }

  it(`form should be valid`, () => {
    spyOn(component, 'onSubmit');
    fillForm();
    fixture.detectChanges();
    el = fixture.debugElement.query(By.css('button')).nativeElement;
    el.click();
    expect(component.registrationForm.valid).toBeTruthy();
    expect(component.onSubmit).toHaveBeenCalledTimes(1);
  });

  it(`form should be invalid without phone number`, () => {
    fillForm();
    component.registrationForm.controls['phoneNumber'].setValue("");
    expect(component.registrationForm.valid).toBeFalsy();
  });

  it(`form should be invalid without address`, () => {
    fillForm();
    component.registrationForm.controls['address'].setValue("");
    expect(component.registrationForm.valid).toBeFalsy();
  });

  it(`form should be invalid without surname`, () => {
    fillForm();
    component.registrationForm.controls['lastName'].setValue("");
    expect(component.registrationForm.valid).toBeFalsy();
  });

  it(`form should be invalid without name`, () => {
    fillForm();
    component.registrationForm.controls['firstName'].setValue("");
    expect(component.registrationForm.valid).toBeFalsy();
  });

  it(`form should be invalid without password confirmation`, () => {
    fillForm();
    component.registrationForm.controls['confirmPassword'].setValue("");
    expect(component.registrationForm.valid).toBeFalsy();
  });


  it(`form should be invalid without password`, () => {
    fillForm();
    component.registrationForm.controls['password'].setValue("");
    expect(component.registrationForm.valid).toBeFalsy();
  });


  it(`form should be invalid without email`, () => {
    fillForm();
    component.registrationForm.controls['email'].setValue("");
    expect(component.registrationForm.valid).toBeFalsy();
  });

  it(`form should be invalid with invalid email format`, () => {
    fillForm();
    component.registrationForm.controls['email'].setValue(mockUser1.email.replace("@", ""));
    expect(component.registrationForm.valid).toBeFalsy();
  });

  it(`form should be invalid with invalid phone number format`, () => {
    fillForm();
    component.registrationForm.controls['phoneNumber'].setValue("grsdrsaewr");
    expect(component.registrationForm.valid).toBeFalsy();
  });

  it(`form should be invalid with invalid password format`, () => {
    fillForm();
    component.registrationForm.controls['password'].setValue("asd");
    component.registrationForm.controls['confirmPassword'].setValue("asd");
    expect(component.registrationForm.valid).toBeFalsy();
  });

  it(`form should be invalid with invalid confirm password`, () => {
    fillForm();
    component.registrationForm.controls['password'].setValue("asd123");
    component.registrationForm.controls['confirmPassword'].setValue("asd1234");
    expect(component.registrationForm.valid).toBeFalsy();
  });
});
