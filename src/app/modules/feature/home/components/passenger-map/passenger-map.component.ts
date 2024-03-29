import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {LeafletMouseEvent, Marker} from 'leaflet';
import 'leaflet-routing-machine';
import {MapService} from "../../services/map.service";
import {DestinationPickerService} from "../../../ride/services/destination-picker.service";
import {LocationInfo} from "../../../../shared/models/LocationInfo";
import {RideService} from "../../../ride/services/ride.service";
import {interval, Subject, Subscription} from "rxjs";
import {PassengerRideNotificationsService} from "../../../ride/services/passenger-ride-notifications.service";
import {RideInfo} from "../../../../shared/models/RideInfo";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DriverRideNotificationService} from "../../../ride/services/driver-ride-notification.service";
import {Vehicle} from "../../../../shared/models/Vehicle";
import {VehicleService} from "../../../../shared/services/vehicle.service";

@Component({
  selector: 'app-passenger-map',
  templateUrl: './passenger-map.component.html',
  styleUrls: ['./passenger-map.component.css']
})
export class PassengerMapComponent implements AfterViewInit, OnInit, OnDestroy{
  private map:any;
  private fromAddressMarker?:Marker;
  private toAddressMarker?:Marker;
  private canSelectFromAddress = false;
  private canSelectToAddress = false;
  private path?:L.Routing.Control;
  private driverLocationSubscription?:Subscription;
  private startRideSubscription?:Subscription;
  private destination?:LocationInfo;
  hasActiveRide = false;
  currentRide?:RideInfo;
  rideDistance?:number;
  rideDistanceLeftChanged:Subject<number> = new Subject<number>();

  private vehiclesUpdateSubscription: Subscription;
  private vehiclesMarkersLayout!:L.LayerGroup;
  private vehiclesMarkersMap = new Map<number, L.Marker>();
  private counter = 0;
  constructor(private mapService:MapService,
              private destinationPickerService:DestinationPickerService,
              private rideService:RideService,
              private passengerRideService:PassengerRideNotificationsService,
              private snackBar: MatSnackBar,
              private driverRideService:DriverRideNotificationService,
              private _vehicleService: VehicleService,
              private _rideService: RideService) {
    this.vehiclesUpdateSubscription = interval(1000).subscribe((() => {
      this.updateVehicles();
    }));
  }

  updateVehicles(){
    this._vehicleService.getAllVehicles().subscribe({
      next: (vehicles) => {
        if (this.counter%10 == 0 ){
          this.vehiclesMarkersLayout.clearLayers();
        }

        vehicles.forEach((vehicle) => {
          if (this.counter%10 == 0){
            this.recreateMarker(vehicle);
          }
          else if (this.vehiclesMarkersMap.get(vehicle.id)){
              this.vehiclesMarkersMap.get(vehicle.id)?.setLatLng([vehicle.currentLocation.latitude, vehicle.currentLocation.longitude]);
          }
        });

        this.counter++;
      }});
  }

  recreateMarker(vehicle: Vehicle){
    this._rideService.getDriverActiveRide(vehicle.driverId).subscribe({
      next: (ride) => {
        let iconPath = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
        if (ride != null) {
          if (this.currentRide != undefined && ride.id == this.currentRide.id){
            return;
          }
          iconPath = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png';
        }
        const markerIcon = new L.Icon({
          iconUrl: iconPath,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [0, -35],
          shadowSize: [41, 41]
        });
        const marker = L.marker([vehicle.currentLocation.latitude, vehicle.currentLocation.longitude], {icon: markerIcon});
        this.vehiclesMarkersLayout.addLayer(marker);
        this.vehiclesMarkersMap.set(vehicle.id, marker);
        this.vehiclesMarkersLayout.addTo(this.map);
      }});
  }

  private initMap():void{
    this.map = L.map('map', {
      center:[45.2396, 19.8227],
      scrollWheelZoom:false,
      zoom:13
    });
    this.vehiclesMarkersLayout = L.layerGroup();
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
      const routes:any = e.routes;
      const summary = routes[0].summary;
      this.rideDistance = summary.totalDistance / 1000.0;
    });
    this.destinationPickerService.path.next(this.path);
  }

  ngAfterViewInit(): void {
    console.log("---------------- AfterViewInit ----------------");
    L.Marker.prototype.options.icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -35],
      shadowSize: [41, 41]
    });
    this.initMap();

    this.passengerRideService.rideAcceptedEvent.subscribe(ride => {
      this.currentRide = ride;
      this.startRideSubscription = this.passengerRideService.startRideEvent.subscribe(() => {
        if(this.fromAddressMarker != undefined && this.toAddressMarker != undefined){
          this.map.removeControl(this.fromAddressMarker);
          this.map.removeControl(this.toAddressMarker);
        }
        this.fromAddressMarker = undefined;
        this.toAddressMarker = undefined;
        this.hasActiveRide = true;
        const loc = ride.locations.at(0);
        if(loc != null){
          this.destination = loc.destination;
        }
        this.driverLocationSubscription = this.passengerRideService.driverLocationUpdatedEvent.subscribe(coordinates => {
          if(this.path == null){
            if(this.destination!=null){
              this.path = L.Routing.control({
                addWaypoints:false,
                autoRoute:true,
                waypoints: [L.latLng(coordinates.latitude, coordinates.longitude), L.latLng(this.destination.latitude, this.destination.longitude)],
              }).addTo(this.map).on('routesfound', e => {
                const routes:any = e.routes;
                const summary = routes[0].summary;
                this.rideDistance = summary.totalDistance / 1000.0;
              });
            }
          }else{
            if(this.destination!=null)
              this.path?.setWaypoints([L.latLng(coordinates.latitude, coordinates.longitude), L.latLng(this.destination.latitude, this.destination.longitude)]);
            this.path.on('routesfound', e => {
              const routes: any = e.routes;
              const summary = routes[0].summary;
              const distance: number = summary.totalDistance / 1000.0;
              this.rideDistanceLeftChanged.next(distance);
            });
          }

        });
        this.passengerRideService.endRideEvent.subscribe(() => {
          this.hasActiveRide = false;
          this.currentRide = undefined;
          this.driverLocationSubscription?.unsubscribe();
          this.startRideSubscription?.unsubscribe();
          this.map.removeControl(this.path);
          this.path = undefined;
        });


        this.vehiclesUpdateSubscription.unsubscribe();
        this.counter = 0;
        this.vehiclesMarkersLayout.clearLayers();
        this.vehiclesUpdateSubscription = interval(1000).subscribe((() => {
          this.updateVehicles();
        }));
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
      const fromLatlng:any = this.fromAddressMarker.getLatLng();
      const toLatlng:any = this.toAddressMarker.getLatLng();
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
        const address:LocationInfo = {latitude: 0, longitude: 0, address: ""};
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
      this.snackBar.open("Vehicle arrived at pickup location", "Ok", {
        panelClass: ["snack-bar-style"],
      });
    });
  }

  ngOnDestroy() {
    this.vehiclesUpdateSubscription.unsubscribe();
  }
}
