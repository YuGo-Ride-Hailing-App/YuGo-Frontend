import { Component } from '@angular/core';
import {RideProperties} from "../model/RideProperties";
import {LocationInfo} from "../../../shared/models/LocationInfo";
import {RideService} from "../services/ride.service";
import {RideBooking} from "../model/RideBooking";
import {AuthService} from "../../../core/services/auth.service";
import {Router} from "@angular/router";
import {Subject} from "rxjs";
import {RideInfo} from "../../../shared/models/RideInfo";
import {UserSimpleInfo} from "../../../shared/models/UserSimpleInfo";

@Component({
  selector: 'app-ride',
  templateUrl: './ride.component.html',
  styleUrls: ['./ride.component.css']
})
export class RideComponent {
  formPageIndex = 0;

  rideDateTime?:Date;
  rideProperties?:RideProperties;
  fromAddress?:LocationInfo;
  toAddress?:LocationInfo;
  passengers?:UserSimpleInfo[];

  searchingDriver = false;

  errorMessageEvent:Subject<string> = new Subject<string>();
  rideFoundEvent:Subject<RideInfo> = new Subject<RideInfo>();

  constructor(private rideService:RideService, private authService:AuthService, private router: Router) {
  }

  switchFormPage(switchDirection:number){
    if(this.formPageIndex + switchDirection > 3){
      this.formPageIndex += switchDirection;
      this.searchingDriver = true;
      this.bookRide().then(() => {
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
    console.log(this.passengers);
    const ride:RideBooking = {
      locations:[{departure:this.fromAddress!, destination:this.toAddress!}],
      passengers:this.passengers!,
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
