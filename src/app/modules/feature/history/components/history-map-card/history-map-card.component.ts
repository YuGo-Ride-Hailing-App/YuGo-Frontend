import {AfterViewInit, Component, Inject} from '@angular/core';
import {MapService} from "../../../home/services/map.service";
import * as L from "leaflet";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {RideInfo} from "../../../../shared/models/RideInfo";
import {RideDataInfo} from "../history-review-card-passenger/history-review-card-passenger.component";

@Component({
  selector: 'app-history-map-card',
  templateUrl: './history-map-card.component.html',
  styleUrls: ['./history-map-card.component.css']
})
export class HistoryMapCardComponent implements  AfterViewInit{
  private map:any;
  public ride: RideInfo
  constructor(private mapService:MapService,@Inject(MAT_DIALOG_DATA) public data: RideDataInfo) {
    this.ride = data.ride;
  }
  private initMap():void{
    this.map = L.map('map', {
      center:[45.2396, 19.8227],
      scrollWheelZoom:false,
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
    this.route();
  }
  route(): void {
    L.Routing.control({
      waypoints: [L.latLng(this.ride.locations[0].departure.latitude, this.ride.locations[0].departure.longitude), L.latLng(this.ride.locations[0].destination.latitude, this.ride.locations[0].destination.longitude)],addWaypoints: false
    }).addTo(this.map);
  }


  ngAfterViewInit(): void {
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    this.initMap();
  }
}
