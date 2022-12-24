import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{

  userType='UNREGISTERED';

  constructor(public dialog: MatDialog, private authService: AuthService, private router: Router) {

  }
  ngOnInit() {
    if (this.authService.getRole()!=null){
      this.userType=this.authService.getRole();
    }
  }

  openLoginDialog() {
    this.dialog.open(LoginComponent).afterClosed().subscribe(
      value =>{
        if (!value){
          this.userType="UNREGISTERED";
        }
        else{

          this.userType = value;
        }});
  }

  openRegisterDialog(){
    this.dialog.open(RegisterComponent, {
      width: '50%'
    });
  }

  logOut(){
    this.authService.logOut().subscribe({
      next: (result) => {
        localStorage.removeItem('user');
        this.authService.setUser();
        this.router.navigate(['/']);
      },
      error: (error) => {},
    });
  }
}
