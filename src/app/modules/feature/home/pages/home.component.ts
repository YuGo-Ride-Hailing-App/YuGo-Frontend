import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../../core/services/auth.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  constructor(private authService:AuthService){
  }

  role?:string;

  ngOnInit(): void {
    this.authService.userState$.subscribe(value => {
      this.role = value;
    });
  }


}
