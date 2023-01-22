import {Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {RegistrationService} from "../../../services/registration.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {Observable, of, take} from "rxjs";
import {UserRegistration} from "../../../models/UserRegistration";
import {HttpErrorResponse} from "@angular/common/http";
import {Vehicle} from "../../../../shared/models/Vehicle";
import {VehicleService} from "../../../../shared/services/vehicle.service";
import {UserInfo} from "../../../../shared/models/UserInfo";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-driver-register',
  templateUrl: './driver-register.component.html',
  styleUrls: ['./driver-register.component.css']
})
export class DriverRegisterComponent {
  TEL_REGEX:string = "^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\\s./0-9]{0,10}$";
  LICENSE_NUMBER_REGEX:string= "[A-Z][A-Z][0-9]*[A-Z][A-Z]";
  accountErrorMessage:string = '';
  vehicleErrorMessage:string = '';

  vehicleDetailsForm : FormGroup;
  registrationForm : FormGroup;
  constructor(private _snackBar: MatSnackBar, private _vehicleService: VehicleService,
              private _registrationService:RegistrationService, private dialogRef:MatDialogRef<DriverRegisterComponent>,
              @Inject(MAT_DIALOG_DATA) public unregistered: boolean) {

    this.registrationForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, this.passwordValidator()]),
      confirmPassword: new FormControl('', [Validators.required],[this.confirmPasswordValidator()]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required, Validators.pattern(this.TEL_REGEX)])
    });

    this.vehicleDetailsForm = new FormGroup({
      model: new FormControl('', [Validators.required]),
      vehicleType: new FormControl('STANDARD', [Validators.required]),
      licenseNumber: new FormControl('', [Validators.required, Validators.pattern(this.LICENSE_NUMBER_REGEX)]),
      babyTransport: new FormControl(false),
      petTransport: new FormControl(false),
      passengerSeats: new FormControl(1, [Validators.required]),
    });
  }
  ngAfterViewInit(): void {
    this.registrationForm.controls['password'].valueChanges.subscribe(()=>{
      this.registrationForm.controls['confirmPassword'].updateValueAndValidity();
    });
  }

  private passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if(control.value.length < 6){
        return {minLength:{value:control.value}};
      }
      if(control.value.length > 20){
        return {maxLength:{value:control.value}};
      }
      let whiteSpaceRegex:RegExp = new RegExp("^(?!.* ).{6,20}$")
      if(!whiteSpaceRegex.test(control.value)){
        return {whitespace:{value:control.value}};
      }
      return null;
    };
  }
  private confirmPasswordValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return of((() => {
        const passwordField = this.registrationForm.controls['password'];
        if(passwordField?.valid){
          if(passwordField.value != control.value){
            return {passwordsNotMatching:{value:control.value}};
          }
        }
        return null;
      })());
    };
  }

  @ViewChild('registerItem') registerItem!: ElementRef;
  @ViewChild('vehicleCreateItem') vehicleCreateItem!: ElementRef;

  onSubmit(){
    if (this.vehicleDetailsForm.valid && this.registrationForm.valid) {
      let user:UserRegistration = {
        name:this.registrationForm.controls['firstName'].value,
        surname:this.registrationForm.controls['lastName'].value,
        address:this.registrationForm.controls['address'].value,
        telephoneNumber:this.registrationForm.controls['phoneNumber'].value,
        password:this.registrationForm.controls['password'].value,
        email:this.registrationForm.controls['email'].value
      };

      let vehicleDetails: Vehicle = {
        "id": 0,
        "driverId": 0,
        "model": this.vehicleDetailsForm.controls['model'].value,
        "vehicleType": this.vehicleDetailsForm.controls['vehicleType'].value,
        "licenseNumber": this.vehicleDetailsForm.controls['licenseNumber'].value,
        "babyTransport": this.vehicleDetailsForm.controls['babyTransport'].value,
        "petTransport": this.vehicleDetailsForm.controls['petTransport'].value,
        "passengerSeats": this.vehicleDetailsForm.controls['passengerSeats'].value,
        "currentLocation": {
          "address": "Null Island",
          "longitude": 0,
          "latitude": 0
        }
      }

      this._registrationService.registerDriver(user).subscribe({
        next:(driver: UserInfo)=>{
          this._vehicleService.createVehicle(driver.id, vehicleDetails).pipe(take(1)).subscribe({
            next: () => {
              this.dialogRef.close();
              this._snackBar.open("Driver registered successfully!", "OK");
            },
            error: (error) => {
              if (error instanceof HttpErrorResponse) {
                this.vehicleErrorMessage = error.error.message;
              }
            }
          });
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            this.accountErrorMessage = error.error.message;
            this.vehicleCreateItem.nativeElement.classList.remove('active');
            this.registerItem.nativeElement.classList.add('active');
          }
        }
      });
    }
  }
}
