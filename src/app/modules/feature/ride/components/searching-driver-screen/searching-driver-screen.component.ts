import {Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {RideInfo} from "../../../../shared/models/RideInfo";
import {RideService} from "../../services/ride.service";
import {PassengerRideNotificationsService} from "../../services/passenger-ride-notifications.service";

@Component({
  selector: 'app-searching-driver-screen',
  templateUrl: './searching-driver-screen.component.html',
  styleUrls: ['./searching-driver-screen.component.css']
})
export class SearchingDriverScreenComponent implements OnInit{
  @Input() rideFoundEvent?:Observable<RideInfo | undefined>;
  @Input() errorMessageEvent?:Observable<string>;
  text:string = "We are searching a driver for your ride, please wait."
  loading:boolean = true;
  constructor(private passengerRideService:PassengerRideNotificationsService) {
  }
  ngOnInit(){
    this.rideFoundEvent?.subscribe({
      next: ride => {
        if(!ride){
          return;
        }
        if(ride.status == "SCHEDULED"){
            this.text = "The ride has been scheduled. You will get a confirmation notification, 30 minutes before ride."
            this.loading = false;
          }
      },
      error: err => {
        this.text = err.error;
        this.loading = false;
      }
    });
    this.passengerRideService.rideAcceptedEvent.subscribe(ride => {
      let date:Date = new Date(ride.startTime);
      this.text = "Driver is on his way.\nEstimated time of arrival: " + date.getHours() + ":" + date.getMinutes() + "h";
      this.loading = false;
    });
    this.passengerRideService.rideRejectedEvent.subscribe(ride => {
      this.text = "We couldn't find available driver, please try again later."
      this.loading = false;
    });
    this.passengerRideService.rideNotAvailableEvent.subscribe(()=> {
      console.log("-----------------------");
      this.text = "We couldn't find available driver, please try again later.";
      this.loading = false;
    });
  }
}
