import { Component, Input} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {UserService} from "../../../../shared/services/user.service";
import {HttpErrorResponse} from "@angular/common/http";
import {Observable, of, take} from "rxjs";
import {AuthService} from "../../../../core/services/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css']
})
export class PasswordComponent{
  @Input()
  public userId = -1;
  passwordForm : FormGroup;
  editEnabled: boolean;

  errorMessage = '';
  constructor(private _snackBar: MatSnackBar, private _userService : UserService, private _authService: AuthService, private _router: Router) {
    this.passwordForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, this.passwordValidator()]),
      confirmPassword: new FormControl('', [Validators.required], [this.confirmPasswordValidator()]),
    });
    this.passwordForm.disable();
    this.editEnabled = false;
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

  enableEdit() : void{
    this.passwordForm.enable();
    this.editEnabled = true;
  }

  cancelEdit() : void{
    this.passwordForm.patchValue({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    this.passwordForm.disable();
    this.editEnabled = false;
    this.errorMessage = "";
  }

  submitEdit() : void {
    this._userService.changePassword(this.userId, {
      "oldPassword": this.passwordForm.controls['currentPassword'].value,
      "newPassword": this.passwordForm.controls['newPassword'].value
    }).pipe(take(1)).subscribe({
      next: () => {
        this.cancelEdit();
        this._snackBar.open("Password successfully changed!", "OK");
        if (this.userId == this._authService.getId()){
          this._authService.logOut().subscribe({
            next: () => {
              localStorage.clear()
              this._authService.setUser();
              this._router.navigate(['/']).then(() => {
                window.location.reload();
              });
            }
          });
        }
      },
      error: (error) => {
        if (error instanceof HttpErrorResponse) {
          this.errorMessage = error.error.message;
        }
      }
    })
  }
}
