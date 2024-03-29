import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as L from "leaflet";
import {DriverRideNotificationService} from "../../../ride/services/driver-ride-notification.service";
import {Coordinates} from "../../../ride/model/Coordinates";
import {Subject, take} from "rxjs";
import {Marker} from "leaflet";
import {RideInfo} from "../../../../shared/models/RideInfo";
import {DriverService} from "../../../../shared/services/driver.service";
import {AuthService} from "../../../../core/services/auth.service";
import {RideService} from "../../../ride/services/ride.service";

@Component({
  selector: 'app-driver-map',
  templateUrl: './driver-map.component.html',
  styleUrls: ['./driver-map.component.css']
})
export class DriverMapComponent implements AfterViewInit, OnInit{

  private map?:L.Map;
  private driverLocation?:Coordinates;
  private driverLocationMarker?:Marker;
  private destination?:Coordinates;

  private path?:L.Routing.Control;

  driverStatus?:string;
  currentRide?:RideInfo;
  calculateDistance = 0      // 0 - distance not calculated and shouldn't be | 1 - distance not calculated but should be | 2 - distance calculated
  rideDistance?:number;
  distanceLeftChanged:Subject<number> = new Subject<number>();
  inrideDataReady = false;

  rideStatus?:number;   // 0 - no active ride | 1 - there is an active ride, but it is not started yet | 2 - there is an active ride, and it is started

  constructor(private driverRideService:DriverRideNotificationService, private driverService:DriverService, private authService:AuthService, private rideService:RideService) {
  }
  ngOnInit(): void {
    this.driverService.getDriverStatus(this.authService.getId()).subscribe(status =>{
      if(status.online){
        this.driverStatus = "online";
      }
      else{
        this.driverStatus = "offline";
      }
    });
  }
  changeDriverStatus(event:string){
    this.driverStatus = event;
    const val:boolean = this.driverStatus == "online";
    this.driverService.updateDriverStatus(this.authService.getId(), {online: val}).subscribe();
  }

  private initMap():void{
    if(this.driverLocation!=null) {
      this.map = L.map('map-driver', {
        center: [this.driverLocation.latitude, this.driverLocation.longitude],
        scrollWheelZoom: false,
        zoom: 13
      });}else{
      this.map = L.map('map-driver', {
        center: [44,19],
        scrollWheelZoom: false,
        zoom: 13
      });
    }

    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );
    tiles.addTo(this.map);
  }

  private checkForRoute(){
    if(this.driverLocation && this.destination){
      if(this.path){
        this.path.setWaypoints([L.latLng(this.driverLocation.latitude, this.driverLocation.longitude), L.latLng(this.destination.latitude, this.destination.longitude)]);
      }else{
        if (this.map!=null)
          this.path = L.Routing.control({
            autoRoute:true,
            addWaypoints:false,
            waypoints: [L.latLng(this.driverLocation.latitude, this.driverLocation.longitude), L.latLng(this.destination.latitude, this.destination.longitude)],
          }).addTo(this.map);
      }
      if(this.rideStatus == 2){
        if(this.path!=null) {
          this.path.on('routesfound', e => {
            const routes: any = e.routes;
            const summary = routes[0].summary;
            const distance: number = summary.totalDistance / 1000.0;
            if (this.calculateDistance == 1) {
              this.calculateDistance = 2;
              this.rideDistance = distance;
              this.inrideDataReady = true;
            }
            this.distanceLeftChanged.next(distance);
          });
        }
      }
    }
  }

  startRide(){
    console.log(this);
    this.rideStatus = 2;
    this.driverRideService.startCurrentRide();
  }
  endRide(){
    this.rideStatus = 0;
    this.calculateDistance = 0;
    this.inrideDataReady = false;
    if(this.map!=null && this.path!=null)
    this.map.removeControl(this.path);
    this.path = undefined;
    this.destination = undefined;
    this.driverRideService.endCurrentRide();
  }

  ngAfterViewInit(): void {
    L.Marker.prototype.options.icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
      iconAnchor: [12.5, 41]
    });

    this.driverRideService.currentRideChangedEvent.subscribe(ride => {
      this.currentRide = ride;
      if(!ride){
        this.rideStatus = 0;
      }else{
        this.rideStatus = 1;
      }
    });
    this.driverRideService.currentDriverLocation.pipe(take(1)).subscribe(coordinates => {
      this.driverLocation = coordinates;
      this.initMap();
    });
    this.driverRideService.currentDriverLocation.subscribe(coordinates => {

      this.driverLocation = coordinates;
      if(this.driverLocationMarker){
        this.driverLocationMarker.setLatLng([coordinates.latitude, coordinates.longitude]);
      }else {
        if (this.map!=null)
          this.driverLocationMarker = L.marker([coordinates.latitude, coordinates.longitude]).addTo(this.map);
      }
      this.checkForRoute();
    });
    this.driverRideService.driverDestination.subscribe(coordinates => {
      console.log(this.rideStatus);
      if(this.rideStatus == 2 && this.calculateDistance == 0){
        this.calculateDistance = 1;
      }
      this.destination = coordinates;
      this.checkForRoute();
    });
  }

  nodPassengers() {
    if(this.currentRide!=null)
      this.rideService.notifyPassengersThatVehicleHasArrived(this.currentRide.id).subscribe();
  }
}
