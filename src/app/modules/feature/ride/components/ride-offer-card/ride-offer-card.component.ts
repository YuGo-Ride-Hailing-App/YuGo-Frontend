import { AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {RideInfo} from "../../../../shared/models/RideInfo";
import {MapService} from "../../../home/services/map.service";
import * as L from "leaflet";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {LocationInfo} from "../../../../shared/models/LocationInfo";
import {PassengerService} from "../../../../shared/services/passenger.service";
import {RideService} from "../../services/ride.service";
import {DriverRideNotificationService} from "../../services/driver-ride-notification.service";

@Component({
  selector: 'app-ride-offer-card',
  templateUrl: './ride-offer-card.component.html',
  styleUrls: ['./ride-offer-card.component.css']
})
export class RideOfferCardComponent implements OnInit,AfterViewInit{
  private map:any;
  passengerName="John Doe";
  startLocation="Bulevar Oslobodjenja 30";
  endLocation="Majke Jevrosime 112";
  numOfPassengers=2;
  rejectionText?:string = "";
  rejectionFormEnabled = false;

  constructor(private mapService:MapService,private dialogRef: MatDialogRef<RideOfferCardComponent>,
              @Inject(MAT_DIALOG_DATA) private data:RideInfo,
              private passengerService:PassengerService,
              private driverRideService:DriverRideNotificationService,
              private rideService:RideService) {
  }

  private initMap():void{
    this.map = L.map('ride-request-map', {
      center:[45.2396, 19.8227],
      scrollWheelZoom:false,
      dragging:false,
      zoomControl:false,
      doubleClickZoom:false,
      zoom:12
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
  route(depLat:number, depLng:number, destLat:number, destLng:number): void {
    L.Routing.control({
      addWaypoints:false,
      waypoints: [L.latLng(depLat, depLng), L.latLng(destLat, destLng)],
    }).addTo(this.map);
  }


  ngAfterViewInit(): void {
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
      iconAnchor:[12.5, 41]
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    this.initMap();
    const departure:LocationInfo = this.data.locations.at(0)!.departure;
    const destination:LocationInfo = this.data.locations.at(0)!.destination;
    this.route(departure.latitude, departure.longitude, destination.latitude, destination.longitude);
  }

  rejectRide(){
    if(this.rejectionText){
      this.rideService.rejectRide(this.data.id, this.rejectionText).subscribe();
      this.dialogRef.close();
    }
  }

  acceptRide(){
    this.rideService.acceptRide(this.data.id).subscribe();
    this.dialogRef.close();
    this.driverRideService.queueRide(this.data);
  }

  ngOnInit(): void {
    const departure:LocationInfo = this.data.locations.at(0)!.departure;
    const destination:LocationInfo = this.data.locations.at(0)!.destination;
    let tokens:string[] = departure.address.split(',');
    const departureAddress:string = tokens[0] + " " + tokens[1] + " " + tokens[2];
    tokens = destination.address.split(',');
    const destinationAddress:string = tokens[0] + " " + tokens[1] + " " + tokens[2];
    this.startLocation = departureAddress;
    this.endLocation = destinationAddress;
    this.numOfPassengers = this.data.passengers.length;
    this.passengerService.getPassenger(this.data.passengers.at(0)!.id).subscribe(passenger => {
      this.passengerName = passenger.name + " " + passenger.surname;
    });
  }

}
