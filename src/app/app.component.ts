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
  hasActiveRide:boolean = false;
  activeRide?:RideInfo;

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
        if(this.hasActiveRide){
          this.stompClient.subscribe("/ride-topic/notify-passenger-vehicle-location/" + this.userID, (frame:Frame) => {
            let coordinates:Coordinates = JSON.parse(frame.body);
            this.passengerRideService.updateDriverLocation(coordinates);
          }, {id:"vehicle-location"});
        }
      }
    }
  }
  setHasActiveRide(value:boolean){
    if(value){
      this.hasActiveRide = true;
      this.passengerRideService.rideAcceptedEvent.next(this.activeRide!);
      this.stompClient.subscribe("/ride-topic/notify-passenger-vehicle-location/" + this.userID, (frame:Frame) => {
        let coordinates:Coordinates = JSON.parse(frame.body);
        this.passengerRideService.updateDriverLocation(coordinates);
      }, {id:"vehicle-location"});
    }else{
      this.activeRide = undefined;
      this.hasActiveRide = false;
      this.stompClient.unsubscribe("vehicle-location");
    }
  }
  notifyPassengerAboutRide(frame:Frame){
    let message:{rideID:number} = JSON.parse(frame.body);
    this.rideService.getRide(message.rideID).subscribe(ride => {
      this.passengerRideService.rideSearchCompleted(ride);
      if(ride.status == "ACCEPTED"){
        this.activeRide = ride;
        this.setHasActiveRide(true);
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
