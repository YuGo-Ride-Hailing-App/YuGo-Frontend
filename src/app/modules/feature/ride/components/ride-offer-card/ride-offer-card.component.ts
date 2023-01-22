import {Component, Inject, OnInit} from '@angular/core';
import {RideInfo} from "../../../../shared/models/RideInfo";
import {MapService} from "../../../home/services/map.service";
import * as L from "leaflet";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {LocationInfo} from "../../../../shared/models/LocationInfo";
import {PassengerService} from "../../../../shared/services/passenger.service";
import {RideService} from "../../services/ride.service";
import {DriverRideNotificationService} from "../../services/driver-ride-notification.service";
import {Coordinates} from "../../model/Coordinates";

@Component({
  selector: 'app-ride-offer-card',
  templateUrl: './ride-offer-card.component.html',
  styleUrls: ['./ride-offer-card.component.css']
})
export class RideOfferCardComponent implements OnInit{
  private map:any;
  passengerName: string="John Doe";
  startLocation: string="Bulevar Oslobodjenja 30";
  endLocation: string="Majke Jevrosime 112";
  numOfPassengers: number=2;
  rejectionText?:string = "";
  rejectionFormEnabled:boolean = false;

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
    let DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
      iconAnchor:[12.5, 41]
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    this.initMap();
    let departure:LocationInfo = this.data.locations.at(0)!.departure;
    let destination:LocationInfo = this.data.locations.at(0)!.destination;
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
    let departure:LocationInfo = this.data.locations.at(0)!.departure;
    let destination:LocationInfo = this.data.locations.at(0)!.destination;
    let tokens:string[] = departure.address.split(',');
    let departureAddress:string = tokens[0] + " " + tokens[1] + " " + tokens[2];
    tokens = destination.address.split(',');
    let destinationAddress:string = tokens[0] + " " + tokens[1] + " " + tokens[2];
    this.startLocation = departureAddress;
    this.endLocation = destinationAddress;
    this.numOfPassengers = this.data.passengers.length;
    this.passengerService.getPassenger(this.data.passengers.at(0)!.id).subscribe(passenger => {
      this.passengerName = passenger.name + " " + passenger.surname;
    });
  }

}
