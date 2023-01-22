import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { PassengerRegisterComponent } from '../register/passenger-register/passenger-register.component';
import {AuthService} from "../../services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {AccountActivationComponent} from "../account-activation/account-activation.component";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{
  role ="";
  userId = -1;
  routeQueryParams: Subscription;
  loginDialog?: MatDialogRef<LoginComponent>;
  registerDialog?: MatDialogRef<PassengerRegisterComponent>;
  accountActivationDialog?: MatDialogRef<AccountActivationComponent>;

  constructor(private _dialog: MatDialog, private _authService: AuthService, private _router: Router, private _route:ActivatedRoute) {
    this.routeQueryParams = _route.queryParams.subscribe(params => {
      if(params['loginDialog']){
        this.registerDialog?.close();
        this.openLoginDialog();
      }
    });
    this.routeQueryParams = _route.queryParams.subscribe(params => {
      if(params['registerDialog']){
        this.loginDialog?.close();
        this.openRegisterDialog();
      }
    });
    this.routeQueryParams = _route.queryParams.subscribe(params => {
      if(params['accountActivationDialog']){
        this.loginDialog?.close();
        this.openAccountDialog();
      }
    });
  }
  ngOnInit() {
    this._authService.userState$.subscribe(value => this.role = value);
    this.userId = this._authService.getId();
  }

  openLoginDialog() {
    this.loginDialog = this._dialog.open(LoginComponent,{
      width: '20%',
      minWidth: '400px',
      minHeight: '420px',
      height:'50%'
    });
    this.loginDialog.afterClosed().subscribe(() => {
      this._router.navigate(['.'], {relativeTo: this._route});
      this.ngOnInit();
    });
  }
  openRegisterDialog(){
    this.registerDialog = this._dialog.open(PassengerRegisterComponent, {
      width: '40%',
      minWidth: '400px',
      minHeight: '500px',
      data: true
    });
    this.registerDialog.afterClosed().subscribe(() => {
      this._router.navigate(['.'], {relativeTo: this._route});
    });
  }

  openAccountDialog() {
    this.accountActivationDialog = this._dialog.open(AccountActivationComponent,{
      width: '20%',
      minWidth: '400px',
      minHeight: '500px',
      height:'60%'
    });
    this.accountActivationDialog.afterClosed().subscribe(() => {
      this._router.navigate(['.'], {relativeTo: this._route});
      this.ngOnInit();
    });
  }

  logOut(){
    this._authService.logOut().subscribe({
      next: () => {
        localStorage.clear();
        this._authService.setUser();
        this._router.navigate(['/']).then(() => {
          window.location.reload();
        });
      },
      error: () => {
        localStorage.clear();
        this._authService.setUser();
        this._router.navigate(['/']).then(() => {
          window.location.reload();
        });
      },
    });

  }

}
