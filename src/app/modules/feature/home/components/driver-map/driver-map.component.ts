import {AfterViewInit, Component} from '@angular/core';
import * as L from "leaflet";
import {DriverRideNotificationService} from "../../../ride/services/driver-ride-notification.service";
import {Coordinates} from "../../../ride/model/Coordinates";
import {take} from "rxjs";
import {Control, Marker} from "leaflet";

@Component({
  selector: 'app-driver-map',
  templateUrl: './driver-map.component.html',
  styleUrls: ['./driver-map.component.css']
})
export class DriverMapComponent implements AfterViewInit{
  private map:any;
  private driverLocation?:Coordinates;
  private driverLocationMarker?:Marker;
  private destination?:Coordinates;
  private path?:L.Routing.Control;

  rideStatus?:number;   // 0 - no active ride | 1 - there is an active ride, but it is not started yet | 2 - there is an active ride, and it is started

  constructor(private driverRideService:DriverRideNotificationService) {
  }

  private initMap():void{
    this.map = L.map('map-driver', {
      center:[this.driverLocation!.latitude, this.driverLocation!.longitude],
      scrollWheelZoom:false,
      zoom:13
    });
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
        this.path = L.Routing.control({
          autoRoute:true,
          addWaypoints:false,
          waypoints: [L.latLng(this.driverLocation.latitude, this.driverLocation.longitude), L.latLng(this.destination.latitude, this.destination.longitude)],
        }).addTo(this.map);
      }
    }
    else {
      this.map.removeControl(this.path);
    }
  }

  startRide(){
    this.rideStatus = 2;
    this.driverRideService.startCurrentRide();
  }
  endRide(){
    this.driverRideService.endCurrentRide();
    this.destination = undefined;
    this.checkForRoute();
  }

  ngAfterViewInit(): void {
    L.Marker.prototype.options.icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
      iconAnchor: [12.5, 41]
    });
    this.driverRideService.currentRideChangedEvent.subscribe(ride => {
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
        this.driverLocationMarker = L.marker([coordinates.latitude, coordinates.longitude]).addTo(this.map);
      }
      this.checkForRoute();
    });
    this.driverRideService.driverDestination.subscribe(coordinates => {
      this.destination = coordinates;
      this.checkForRoute();
    });
  }
}
