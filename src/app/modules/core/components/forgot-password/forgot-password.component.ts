import {Component, OnInit} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {UserService} from "../../../shared/services/user.service";
import {AuthService} from "../../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable, of, take} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit{
  code=-1;
  passwordForm : FormGroup;

  errorMessage = '';
  constructor(private _route: ActivatedRoute,private _snackBar:MatSnackBar,private _userService : UserService, private _authService: AuthService, private _router: Router) {
    this.passwordForm = new FormGroup({
      newPassword: new FormControl('', [Validators.required, this.passwordValidator()]),
      confirmPassword: new FormControl('', [Validators.required], [this.confirmPasswordValidator()]),
    });
  }
  ngOnInit() {
    this._route.params.subscribe(params => {
      this.code = (params['code']);
    })
  }

  private passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if(control.value.length < 6){
        return {minLength:{value:control.value}};
      }
      if(control.value.length > 20){
        return {maxLength:{value:control.value}};
      }
      const whiteSpaceRegex = new RegExp("^(?!.* ).{6,20}$")
      if(!whiteSpaceRegex.test(control.value)){
        return {whitespace:{value:control.value}};
      }
      return null;
    };
  }

  private confirmPasswordValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return of((() => {
        const passwordField = this.passwordForm.controls['newPassword'];
        if(passwordField?.valid){
          if(passwordField.value != control.value){
            return {passwordsNotMatching:{value:control.value}};
          }
        }
        return null;
      })());
    };
  }

  submitEdit() : void {
    if (this.passwordForm.invalid){

    }
    else {
      this._userService.resetPasswordWithCode(this.code,this.passwordForm.value.newPassword).pipe(take(1)).subscribe({
        next: () => {
          this._snackBar.open("Password Changed Successfully", "OK");
          this._router.navigate(['/']);
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            this.errorMessage = error.error.message;
          }
        }
      })
    }
  }

}
