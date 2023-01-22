import {AfterViewInit, Component} from '@angular/core';
import * as L from "leaflet";
import {DriverRideNotificationService} from "../../../ride/services/driver-ride-notification.service";
import {Coordinates} from "../../../ride/model/Coordinates";
import {Subject, take} from "rxjs";
import { Marker} from "leaflet";
import {RideInfo} from "../../../../shared/models/RideInfo";

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

  currentRide?:RideInfo;
  calculateDistance = 0      // 0 - distance not calculated and shouldn't be | 1 - distance not calculated but should be | 2 - distance calculated
  rideDistance?:number;
  distanceLeftChanged:Subject<number> = new Subject<number>();
  inrideDataReady = false;

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

        this.path.on('routesfound', e => {
          const routes:any = e.routes;
          const summary = routes[0].summary;
          const distance:number = summary.totalDistance / 1000.0;
          if(this.calculateDistance == 1){
            this.calculateDistance = 2;
            this.rideDistance = distance;
            this.inrideDataReady = true;
          }
          this.distanceLeftChanged.next(distance);
        })

      }else{
        this.path = L.Routing.control({
          autoRoute:true,
          addWaypoints:false,
          waypoints: [L.latLng(this.driverLocation.latitude, this.driverLocation.longitude), L.latLng(this.destination.latitude, this.destination.longitude)],
        }).addTo(this.map);
      }
    }
    else if(this.path){
      this.map.removeControl(this.path);
    }
  }

  startRide(){
    this.rideStatus = 2;
    this.driverRideService.startCurrentRide();
  }
  endRide(){
    this.inrideDataReady = false;
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
      this.currentRide = ride;
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
      if(this.rideStatus == 2 && this.calculateDistance == 0){
        this.calculateDistance = 1;
      }
      this.destination = coordinates;
      this.checkForRoute();
    });
  }
}
