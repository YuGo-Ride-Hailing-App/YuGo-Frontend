import { Component } from '@angular/core';
import {RideProperties} from "../model/RideProperties";
import {LocationInfo} from "../../../shared/models/LocationInfo";
import {RideService} from "../services/ride.service";
import {RideBooking} from "../model/RideBooking";
import {AuthService} from "../../../core/services/auth.service";
import {Router} from "@angular/router";
import {Subject} from "rxjs";
import {RideInfo} from "../../../shared/models/RideInfo";

@Component({
  selector: 'app-ride',
  templateUrl: './ride.component.html',
  styleUrls: ['./ride.component.css']
})
export class RideComponent {
  formPageIndex: number = 0;

  rideDateTime?:Date;
  rideProperties?:RideProperties;
  fromAddress?:LocationInfo;
  toAddress?:LocationInfo;
  searchingDriver:boolean = false;

  errorMessageEvent:Subject<string> = new Subject<string>();
  rideFoundEvent:Subject<RideInfo> = new Subject<RideInfo>();

  constructor(private rideService:RideService, private authService:AuthService, private router: Router) {
  }

  test(selectedDateTime:Date){
    console.log(selectedDateTime);
    this.rideDateTime = selectedDateTime;
  }
  switchFormPage(switchDirection:number){
    if(this.formPageIndex + switchDirection > 2){
      this.formPageIndex += switchDirection;
      this.searchingDriver = true;
      this.bookRide().then(_ => {
        //this.formPageIndex = 0;
      });
    }
    else if(this.formPageIndex + switchDirection >= 2 && this.authService.getRole() == "UNREGISTERED"){
      this.router.navigate(['home'], {queryParams:{loginDialog:true}})
    }else{
      this.formPageIndex += switchDirection;
    }
  }
  routeChanged(route:[LocationInfo, LocationInfo]){
    [this.fromAddress, this.toAddress] = route;
  }

  async bookRide(){
    let ride:RideBooking = {
      locations:[{departure:this.fromAddress!, destination:this.toAddress!}],
      passengers:[{id:this.authService.getId(), email:""}],
      vehicleType:this.rideProperties!.vehicleTypeName,
      babyTransport:this.rideProperties!.includeBabies,
      petTransport:this.rideProperties!.includePets,
      dateTime: (new Date(this.rideDateTime!.getTime() - this.rideDateTime!.getTimezoneOffset() * 60000)).toISOString()
    };

    this.rideService.createRide(ride).subscribe({
      next: response => {
        console.log(response);
        this.rideFoundEvent.next(response);
      },
      error: err => {
        console.log(err);
        this.rideFoundEvent.error(err);
      }
    });


  }
}
