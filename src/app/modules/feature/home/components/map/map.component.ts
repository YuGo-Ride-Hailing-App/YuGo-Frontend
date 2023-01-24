import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {LeafletMouseEvent, Marker} from 'leaflet';
import 'leaflet-routing-machine';
import {MapService} from "../../services/map.service";
import {DestinationPickerService} from "../../../ride/services/destination-picker.service";
import {LocationInfo} from "../../../../shared/models/LocationInfo";
import {RideService} from "../../../ride/services/ride.service";
import {Subject, Subscription} from "rxjs";
import {PassengerRideNotificationsService} from "../../../ride/services/passenger-ride-notifications.service";
import {RideInfo} from "../../../../shared/models/RideInfo";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnInit{
  private map:any;
  private fromAddressMarker?:Marker;
  private toAddressMarker?:Marker;
  private canSelectFromAddress:boolean = false;
  private canSelectToAddress:boolean = false;
  private path?:L.Routing.Control;
  private driverLocationSubscription?:Subscription;
  private startRideSubscription?:Subscription;
  private destination?:LocationInfo;
  hasActiveRide:boolean = false;
  currentRide?:RideInfo;
  rideDistance?:number;
  rideDistanceLeftChanged:Subject<number> = new Subject<number>();

  constructor(private mapService:MapService,
              private destinationPickerService:DestinationPickerService,
              private rideService:RideService,
              private passengerRideService:PassengerRideNotificationsService,
              private snackBar: MatSnackBar) {
  }
  private initMap():void{
    this.map = L.map('map', {
      center:[45.2396, 19.8227],
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
  route(fromLat:number, fromLong:number, toLat:number, toLong:number): void {
    if(this.path){
      this.map.removeControl(this.path);
    }
    this.path = L.Routing.control({
      addWaypoints:false,
      autoRoute:true,
      waypoints: [L.latLng(fromLat, fromLong), L.latLng(toLat, toLong)],
    }).addTo(this.map).on('routesfound', e => {
      let routes:any = e.routes;
      let summary = routes[0].summary;
      this.rideDistance = summary.totalDistance / 1000.0;
    });
    this.destinationPickerService.path.next(this.path);
  }

  ngAfterViewInit(): void {
    let DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
      iconAnchor:[12.5, 41]
    });

    L.Marker.prototype.options.icon = DefaultIcon;
    this.initMap();

    this.passengerRideService.rideAcceptedEvent.subscribe(ride => {
      console.log("Passenger is notified about accepted ride");
      this.currentRide = ride;
      this.startRideSubscription = this.passengerRideService.startRideEvent.subscribe(() => {
        this.hasActiveRide = true;
        this.driverLocationSubscription = this.passengerRideService.driverLocationUpdatedEvent.subscribe(coordinates => {
          this.path?.setWaypoints([L.latLng(coordinates.latitude, coordinates.longitude), L.latLng(this.destination!.latitude, this.destination!.longitude)]);
          this.path!.on('routesfound', e => {
            let routes:any = e.routes;
            let summary = routes[0].summary;
            this.rideDistanceLeftChanged.next(summary.totalDistance / 1000.0);
          });
        });
        this.passengerRideService.endRideEvent.subscribe(() => {
          this.map.removeControl(this.fromAddressMarker);
          this.fromAddressMarker = undefined;
          this.map.removeControl(this.toAddressMarker);
          this.toAddressMarker = undefined;
          this.hasActiveRide = false;
          this.currentRide = undefined;
          this.driverLocationSubscription?.unsubscribe();
          this.startRideSubscription?.unsubscribe();
          this.map.removeControl(this.path);
          this.path = undefined;
        });
      });
    });

    this.destinationPickerService.currentFromAddress.subscribe({
      next:(address?:LocationInfo) => {
        if(this.fromAddressMarker){
          this.map.removeControl(this.fromAddressMarker);
        }
        if(!address){
          this.fromAddressMarker = undefined;
        }else{
          this.fromAddressMarker = L.marker([address.latitude, address.longitude]).addTo(this.map);
        }
        this.checkForPath();
      }
    });
    this.destinationPickerService.currentToAddress.subscribe({
      next:(address?:LocationInfo) => {
        if(this.toAddressMarker){
          this.map.removeControl(this.toAddressMarker);
        }
        this.destination = address;
        if(!address){
          this.toAddressMarker = undefined;
        }else {
          this.toAddressMarker = L.marker([address.latitude, address.longitude]).addTo(this.map);
        }
        this.checkForPath();
      }
    });
    this.destinationPickerService.enableManualFromAddressSelection.subscribe({
      next:()=>{
        this.canSelectFromAddress = true;
      }
    });
    this.destinationPickerService.enableManualToAddressSelection.subscribe({
      next:()=>{
        this.canSelectToAddress = true;
      }
    });
    this.map.on('click', (e:LeafletMouseEvent)=>{
      if(this.canSelectToAddress){
        if(this.toAddressMarker){
          this.map.removeControl(this.toAddressMarker);
        }
        this.toAddressMarker = L.marker(e.latlng).addTo(this.map);
        this.reverseAddressSearch(e.latlng.lat, e.latlng.lng).then((address:LocationInfo) => {
          this.destinationPickerService.manuallySelectedToAddress.next(address);
          this.destination = address;
          this.canSelectToAddress = false;
          this.checkForPath();
        });
      }
      else if(this.canSelectFromAddress){
        if(this.fromAddressMarker){
          this.map.removeControl(this.fromAddressMarker);
        }
        this.fromAddressMarker = L.marker(e.latlng).addTo(this.map);
        this.reverseAddressSearch(e.latlng.lat, e.latlng.lng).then((address:LocationInfo)=>{
          this.destinationPickerService.manuallySelectedFromAddress.next(address);
          this.canSelectFromAddress = false;
          this.checkForPath();
        });
      }
    });
  }
  private checkForPath(){
    if(this.toAddressMarker && this.fromAddressMarker){
      let fromLatlng:any = this.fromAddressMarker.getLatLng();
      let toLatlng:any = this.toAddressMarker.getLatLng();
      this.route(fromLatlng.lat, fromLatlng.lng, toLatlng.lat, toLatlng.lng);
    }else{
      if(this.path){
        this.map.removeControl(this.path);
      }
      this.path = undefined;
      this.destinationPickerService.path.next(undefined);
    }
  }
  private reverseAddressSearch(lat:number, lng:number): Promise<LocationInfo>{
    return new Promise<LocationInfo>( resolve => {
        let address:LocationInfo = {latitude: 0, longitude: 0, address: ""};
        this.mapService.reverseSearch(lat, lng).subscribe((val:any) => {
          address.address = val.display_name;
          address.latitude = lat;
          address.longitude = lng;
          resolve(address);
        });
      })

  }

  ngOnInit(): void {
    this.passengerRideService.passengerAddedToRideEvent.subscribe(() => {
      this.snackBar.open("You have been added to the ride", "Ok", {
        panelClass: ["snack-bar-style"],
      });
    });
    this.passengerRideService.vehicleArrivedEvent.subscribe(() => {
      console.log("-------------");
      this.snackBar.open("Vehicle arrived at pickup location", "Ok", {
        panelClass: ["snack-bar-style"],
      });
    });
  }
}
