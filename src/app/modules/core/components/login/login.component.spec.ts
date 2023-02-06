import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import {By} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DebugElement} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [
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

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    de = fixture.debugElement.query(By.css('#loginForm'));
    el = de.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('form should be invalid if password is empty', () => {
    component.loginForm.controls['password'].setValue('');
    component.loginForm.controls['email'].setValue('pera.peric@email.com');
    expect(component.loginForm.valid).toBeFalsy();
  });
  it('form should be invalid if email is empty', () => {
    component.loginForm.controls['email'].setValue('');
    component.loginForm.controls['password'].setValue('Password123');
    expect(component.loginForm.valid).toBeFalsy();
  });
  it('form should be invalid if email and password are empty', () => {
    component.loginForm.controls['email'].setValue('');
    component.loginForm.controls['password'].setValue('');
    expect(component.loginForm.valid).toBeFalsy();
  });
  it('form should be valid', () => {
    component.loginForm.controls['email'].setValue('pera.peric@email.com');
    component.loginForm.controls['password'].setValue('Password123');
    expect(component.loginForm.valid).toBeTruthy();
  });
  it('should not call submitLogin', () => {
    spyOn(component, 'submitLogin');
    el = fixture.debugElement.query(By.css("#loginForm button")).nativeElement;
    el.click();
    expect(component.submitLogin).toHaveBeenCalledTimes(0);
  });
  it('should call submitLogin', () => {
    component.loginForm.controls['email'].setValue('pera.peric@email.com');
    component.loginForm.controls['password'].setValue('Password123');
    spyOn(component, 'submitLogin');
    fixture.detectChanges();
    expect(component.loginForm.valid).toBeTruthy();
    el = fixture.debugElement.query(By.css("#loginForm button")).nativeElement;
    el.click();
    expect(component.submitLogin).toHaveBeenCalledTimes(1);
  });
});
