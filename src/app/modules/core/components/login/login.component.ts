import {Component,} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {HttpErrorResponse} from "@angular/common/http";
import {MatDialogRef} from "@angular/material/dialog";
import {take} from "rxjs";
import {UserService} from "../../../shared/services/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent{
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  errorMessage:string = '';

  forgotPasswordForm = new FormGroup({
    emailForgot: new FormControl('', [Validators.required])
  });

  constructor(private authService: AuthService,private userService:UserService,private _snackBar:MatSnackBar, private router: Router, private dialogRef:MatDialogRef<LoginComponent>) {}


  submitLogin(){
    const loginVal = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    if (this.loginForm.valid) {
      this.authService.logIn(loginVal).pipe(take(1)).subscribe({
        next: (result) => {
          localStorage.setItem('token', result.accessToken);
          localStorage.setItem('refreshToken', result.refreshToken);
          this.authService.setUser();
          this.dialogRef.close(this.authService.getRole());
          this.router.navigate(['/']);
        },
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            this.errorMessage = error.error.message;
          }
        },
      });
    }
  }
  submitForgot(){
    const loginVal = {
      email: this.forgotPasswordForm.value.emailForgot
    };
    if (this.forgotPasswordForm.valid){
        this.userService.sendPasswordCodeEfficient(loginVal.email!).subscribe({next:(returnCode)=>{
            this._snackBar.open("Email sent to "+ loginVal.email, "OK");
            this.dialogRef.close();
          }})
    }

  }
  navigateToRegister() {
    this.router.navigate(['home'], {queryParams:{registerDialog:true}});
    this.dialogRef.close();
  }
}
