import {
  Component,
  ComponentFactoryResolver, ComponentRef,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2, ViewChild,
  ViewContainerRef
} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {RideOfferCardComponent} from "./modules/feature/ride/components/ride-offer-card/ride-offer-card.component";
import {environment} from "../enviroments/environment";
import {AuthService} from "./modules/core/services/auth.service";
import {RideService} from "./modules/feature/ride/services/ride.service";
import {Frame} from "stompjs";
import * as SockJS from "sockjs-client";
import * as Stomp from "stompjs";
import {Coordinates} from "./modules/feature/ride/model/Coordinates";
import {PassengerRideNotificationsService} from "./modules/feature/ride/services/passenger-ride-notifications.service";
import {DriverRideNotificationService} from "./modules/feature/ride/services/driver-ride-notification.service";
import {DriverService} from "./modules/shared/services/driver.service";
import {PanicService} from "./modules/shared/services/panic.service";
import {take} from "rxjs";
import {PanicCardComponent} from "./modules/feature/panic/components/panic-card/panic-card.component";
import {
  HistoryReviewCardPassengerComponent
} from "./modules/feature/history/components/history-review-card-passenger/history-review-card-passenger.component";
import {LiveChatComponent} from "./modules/shared/components/live-chat/live-chat.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['../styles.css','./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{
  title = 'YuGo';
  private serverUrl = environment.apiHost + 'socket'
  private stompClient: any;
  isLoaded = false;
  @ViewChild('passengerLiveChat') passengerLiveChat: LiveChatComponent | undefined;

  components:ComponentRef<LiveChatComponent>[]=[];

  private role: string | undefined;
  private userID: number | undefined;

  constructor(private authService:AuthService,
              private dialog: MatDialog,
              private rideService:RideService,
              private passengerRideService:PassengerRideNotificationsService,
              private driverRideService:DriverRideNotificationService,
              private driverService:DriverService,
              private panicService: PanicService,
              private renderer: Renderer2,
              private el: ElementRef,private componentFactoryResolver: ComponentFactoryResolver,
              private viewContainerRef: ViewContainerRef) {
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
  private checkIfPassengerIsInRide(passengerID:number){
    this.rideService.getActivePassengerRide(passengerID).subscribe(ride => {
      this.rideService.currentRide = ride;
      this.passengerRideService.rideAcceptedEvent.next(ride);
      this.passengerRideService.startRideEvent.next(ride);
      this.stompClient.subscribe("/ride-topic/notify-passenger-vehicle-location/" + this.userID, (frameLocation:Frame) => {
        const coordinates:Coordinates = JSON.parse(frameLocation.body);
        this.passengerRideService.driverLocationUpdatedEvent.next(coordinates);
      }, {id:"notify-passenger-vehicle-location"});
      this.stompClient.unsubscribe("notify-passenger-start-ride");
      this.stompClient.subscribe("/ride-topic/notify-passenger-end-ride/" + this.userID, () => {
        this.dialog.open(HistoryReviewCardPassengerComponent,{
          data: {ride:ride, userId:this.authService.getId(), role:this.role},
          width: '60%',
          maxWidth: '600px',
          backdropClass: 'backdropBackground',
          hasBackdrop:true
        })
        this.passengerRideService.endRideEvent.next(ride);
        this.rideService.currentRide = undefined;
        this.stompClient.unsubscribe("notify-passenger-end-ride");
        this.stompClient.unsubscribe("notify-passenger-vehicle-location");
        this.stompClient.unsubscribe("notify-passenger-vehicle-arrival");
        this.stompClient.unsubscribe("notify-passenger-vehicle-arrival");
      }, {id:"notify-passenger-end-ride"});
    });
  }
  private subscribeToSocket(){
    if(this.isLoaded){
      if(this.role == "DRIVER"){
        if(this.userID!=null)
          this.driverService.getLocation(this.userID).subscribe(coordinates => {
            this.driverRideService.currentDriverLocation.next(coordinates);
          });
        this.stompClient.subscribe("/ride-topic/driver-request/" + this.userID, (frame:Frame) => {
          this.parseRideRequest(frame);
        }, {id:"driver-request"});
        this.stompClient.subscribe("/live-chat-topic/"+this.userID, (frame: Frame) => {
          this.notifyPassengerAboutLiveChat(frame);
        }, {id:"user-live-chat"});
      }
      else if(this.role == "PASSENGER"){
        this.checkIfPassengerIsInRide(this.authService.getId());
        this.stompClient.subscribe("/ride-topic/notify-passenger/" + this.userID, (frame:Frame) => {
          this.notifyPassengerAboutRide(frame);
        },{id:"notify-passenger"});
        this.stompClient.subscribe("/ride-topic/notify-added-passenger/" + this.userID, (frame:Frame) => {
          const message:{rideID:number} = JSON.parse(frame.body);
          this.rideService.getRide(message.rideID).subscribe(ride => {
            this.passengerRideService.passengerAddedToRideEvent.next(ride);
          });
        });
        this.stompClient.subscribe("/live-chat-topic/"+this.userID, (frame: Frame) => {
          this.notifyPassengerAboutLiveChat(frame);
        }, {id:"user-live-chat"})
      }
      else if (this.role == "ADMIN"){
        this.stompClient.subscribe("/ride-topic/notify-admin-panic", (frame: Frame) => {
          this.notifyAdminAboutPanic(frame);
        }, {id:"admin-panic"})
        this.stompClient.subscribe("/live-chat-topic/admin", (frame: Frame) => {
          this.notifyAdminAboutLiveChat(frame);
        }, {id:"admin-live-chat"})
      }
    }
  }
  notifyAdminAboutPanic(frame: Frame){
    const message:{panicId:number} = JSON.parse(frame.body);
    this.panicService.getPanic(message.panicId).pipe(take(1)).subscribe({
        next: panic =>{
          const panicDialog = this.dialog.open(PanicCardComponent, {
            minWidth: '350px',
            minHeight: '300px',
            width: '30%',
            height: '40%',
          })
          const panicDialogInstance = panicDialog.componentInstance;
          panicDialogInstance.panic = panic;
          panicDialogInstance.notification = true;
        }
      }
    )
  }

  notifyAdminAboutLiveChat(frame: Frame){
    const message:{userId:number,message:string} = JSON.parse(frame.body);
    if (this.getComponent(message.userId).instance===undefined){
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(LiveChatComponent);
      const componentRef = this.viewContainerRef.createComponent(componentFactory);
      componentRef.setInput('id',message.userId);
      componentRef.componentType.name
      this.components.push(componentRef);
      componentRef.instance.addMessage(message.message,'self');
      componentRef.instance.bottom=10;
      componentRef.instance.right=(this.components.length-1)*60;
      componentRef.instance.buttonColor="#FF0000";
    }
    else{
      this.getComponent(message.userId).instance.addMessage(message.message,'self');
      this.getComponent(message.userId).instance.buttonColor="#FF0000";

    }
  }

  getComponent(id:number):ComponentRef<LiveChatComponent>{
    let found= {} as ComponentRef<LiveChatComponent>;
    this.components.forEach(function(cmp){
      if (cmp.instance.id===id)
        found=cmp;
    })
    return found;
  }

  notifyPassengerAboutLiveChat(frame: Frame){
    const message:{userId:number,message:string} = JSON.parse(frame.body);
    this.passengerLiveChat?.addMessage(message.message,"self")

    if (this.passengerLiveChat != undefined){
      this.passengerLiveChat.buttonColor="#FF0000";
    }
  }

  notifyPassengerAboutRide(frameRide:Frame){
    const message:{rideID:number} = JSON.parse(frameRide.body);
    if(message.rideID == -1){
      this.passengerRideService.rideNotAvailableEvent.next();
      return;
    }
    this.rideService.getRide(message.rideID).subscribe(ride => {
      if(ride.status == "ACCEPTED"){
        this.passengerRideService.rideAcceptedEvent.next(ride);
        this.stompClient.subscribe("/ride-topic/notify-passenger-vehicle-arrival/" + this.userID, () => {
          this.passengerRideService.vehicleArrivedEvent.next();
        }, {id:"notify-passenger-vehicle-arrival"});
        this.stompClient.subscribe("/ride-topic/notify-passenger-start-ride/" + this.userID, () => {
          this.stompClient.subscribe("/ride-topic/notify-passenger-vehicle-location/" + this.userID, (frameLocation:Frame) => {
            const coordinates:Coordinates = JSON.parse(frameLocation.body);
            this.passengerRideService.driverLocationUpdatedEvent.next(coordinates);
          }, {id:"notify-passenger-vehicle-location"});
          this.rideService.currentRide = ride;
          this.passengerRideService.startRideEvent.next(ride);
          this.stompClient.unsubscribe("notify-passenger-start-ride");
          this.stompClient.subscribe("/ride-topic/notify-passenger-end-ride/" + this.userID, () => {
            this.dialog.open(HistoryReviewCardPassengerComponent,{
              data: {ride:ride, userId:this.authService.getId(), role:this.role},
              width: '60%',
              maxWidth: '600px',
              backdropClass: 'backdropBackground',
              hasBackdrop:true
            })
            this.passengerRideService.endRideEvent.next(ride);
            this.rideService.currentRide = undefined;
            this.stompClient.unsubscribe("notify-passenger-end-ride");
            this.stompClient.unsubscribe("notify-passenger-vehicle-location");
            this.stompClient.unsubscribe("notify-passenger-vehicle-arrival");
            this.stompClient.unsubscribe("notify-passenger-vehicle-arrival");
          }, {id:"notify-passenger-end-ride"});
        }, {id:"notify-passenger-start-ride"});
      }
      else if(ride.status == "REJECTED"){
        this.passengerRideService.rideRejectedEvent.next(ride);
      }
    });
  }
  parseRideRequest(frame:Frame){
    const message:{rideID:number} = JSON.parse(frame.body);
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
    this.stompClient.unsubscribe("admin-panic");
    this.stompClient.unsubscribe("notify-passenger-end-ride");
    this.stompClient.unsubscribe("notify-passenger-start-ride");
    this.stompClient.unsubscribe("admin-live-chat");
    this.stompClient.unsubscribe("user-live-chat");
  }
  initializeWebSocketConnection() {
    const ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    const that = this;

    this.stompClient.connect({}, function () {
      that.isLoaded = true;
      that.subscribeToSocket();
    });
  }

  cahShowLiveChat() {
    return (this.authService.getRole()==="PASSENGER" || this.authService.getRole()==="DRIVER" || this.authService.getRole()==="ADMIN")
  }

  onlyDriverPassengerChat() {
    return (this.authService.getRole()==="PASSENGER" || this.authService.getRole()==="DRIVER")
  }
}
