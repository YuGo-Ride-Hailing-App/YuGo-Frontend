import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {RideOfferCardComponent} from "./modules/feature/ride/components/ride-offer-card/ride-offer-card.component";
import {environment} from "../enviroments/environment";
import {AuthService} from "./modules/core/services/auth.service";
import {RideService} from "./modules/feature/ride/services/ride.service";
import {Frame} from "stompjs";
import * as SockJS from "sockjs-client";
import * as Stomp from "stompjs";
import {Coordinates} from "./modules/feature/ride/model/Coordinates";
import {RideInfo} from "./modules/shared/models/RideInfo";
import {PassengerRideNotificationsService} from "./modules/feature/ride/services/passenger-ride-notifications.service";
import {DriverRideNotificationService} from "./modules/feature/ride/services/driver-ride-notification.service";
import {DriverService} from "./modules/shared/services/driver.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['../styles/styles.css','./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'YuGo';
  private serverUrl = environment.apiHost + 'socket'
  private stompClient: any;
  isLoaded: boolean = false;

  private role: string | undefined;
  private userID: number | undefined;

  constructor(private authService:AuthService,
              private dialog: MatDialog,
              private rideService:RideService,
              private passengerRideService:PassengerRideNotificationsService,
              private driverRideService:DriverRideNotificationService,
              private driverService:DriverService) {
  }

  ngOnInit(): void {
    this.initializeWebSocketConnection();
    this.role = this.authService.getRole();
    this.userID = this.authService.getId();
    this.authService.userState$.subscribe(value => {
      this.role = value;
      this.userID = this.authService.getId();
      this.subscribeToSocket();
    });
  }
  private subscribeToSocket(){
    if(this.isLoaded){
      if(this.role == "DRIVER"){
        this.driverService.getLocation(this.userID!).subscribe(coordinates => {
          this.driverRideService.currentDriverLocation.next(coordinates);
        });
        this.stompClient.subscribe("/ride-topic/driver-request/" + this.userID, (frame:Frame) => {
          this.parseRideRequest(frame);
        }, {id:"driver-request"});
      }
      else if(this.role == "PASSENGER"){
        this.stompClient.subscribe("/ride-topic/notify-passenger/" + this.userID, (frame:Frame) => {
          this.notifyPassengerAboutRide(frame);
        },{id:"notify-passenger"});

      }
    }
  }

  notifyPassengerAboutRide(frameRide:Frame){
    let message:{rideID:number} = JSON.parse(frameRide.body);
    this.rideService.getRide(message.rideID).subscribe(ride => {
      this.stompClient.unsubscribe("notify-passenger");
      if(ride.status == "ACCEPTED"){
        console.log("Passenger is notified that ride is accepted");
        this.passengerRideService.rideAcceptedEvent.next(ride);
        this.stompClient.subscribe("/ride-topic/notify-passenger-start-ride/" + this.userID, () => {
          this.passengerRideService.startRideEvent.next(ride);
          this.stompClient.unsubscribe("notify-passenger-start-ride");
          this.stompClient.subscribe("/ride-topic/notify-passenger-end-ride/" + this.userID, () => {
            this.passengerRideService.endRideEvent.next(ride);
            this.stompClient.unsubscribe("notify-passenger-end-ride");
            this.stompClient.unsubscribe("notify-passenger-vehicle-location");
          }, {id:"notify-passenger-end-ride"});
          this.stompClient.subscribe("/ride-topic/notify-passenger-vehicle-location/" + this.userID, (frameLocation:Frame) => {
            let coordinates:Coordinates = JSON.parse(frameLocation.body);
            this.passengerRideService.driverLocationUpdatedEvent.next(coordinates);
          }, {id:"notify-passenger-vehicle-location"});
        }, {id:"notify-passenger-start-ride"});
      }
      else if(ride.status == "REJECTED"){
        this.passengerRideService.rideRejectedEvent.next(ride);
      }
    });
  }
  parseRideRequest(frame:Frame){
    let message:{rideID:number} = JSON.parse(frame.body);
    this.rideService.getRide(message.rideID).subscribe(ride => {
      this.dialog.open(RideOfferCardComponent,{
        width: '20%',
        minWidth: '400px',
        minHeight: '420px',
        height:'50%',
        disableClose:true,
        data:ride
      });
    });
  }
  ngOnDestroy(){
    this.stompClient.unsubscribe("driver-request");
    this.stompClient.unsubscribe("notify-passenger");
  }
  initializeWebSocketConnection() {
    let ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    let that = this;

    this.stompClient.connect({}, function () {
      that.isLoaded = true;
      that.subscribeToSocket();
    });
  }

}
