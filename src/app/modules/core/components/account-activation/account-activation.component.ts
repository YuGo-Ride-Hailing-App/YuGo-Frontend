import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialogRef} from "@angular/material/dialog";
import {PassengerService} from "../../../shared/services/passenger.service";

@Component({
  selector: 'app-account-activation',
  templateUrl: './account-activation.component.html',
  styleUrls: ['./account-activation.component.css']
})
export class AccountActivationComponent implements OnInit{
  paramsObject:any;
  constructor(private _route: ActivatedRoute,private _router:Router, private _dialogRef:MatDialogRef<AccountActivationComponent>,private passengerService:PassengerService) {

  }
  ngOnInit() {
   this._route.queryParamMap.subscribe(params => {
      this.paramsObject = { ...params.keys, ...params };
      if (this.paramsObject.params["accountActivatedDialog"]==true)
        this.passengerService.activatePassenger(this.paramsObject.params["code"]).subscribe({next:()=>{}});
    })
  }

  navigateToLogin() {
    this._router.navigate(['home'], {queryParams:{loginDialog:true}});
    this._dialogRef.close();
  }
}
