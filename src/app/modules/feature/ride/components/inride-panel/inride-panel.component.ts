import {Component, Input, OnInit} from '@angular/core';
import {RideInfo} from "../../../../shared/models/RideInfo";
import {Observable} from "rxjs";

@Component({
  selector: 'app-inride-panel',
  templateUrl: './inride-panel.component.html',
  styleUrls: ['./inride-panel.component.css']
})
export class InridePanelComponent implements OnInit{
  progressBarHeight = "0%";
  departureAddress = "Bulevar oslobodjenja fsafas asfasfasf asfasfasfa asfasf asfasfas asfasfasf sa saf 30";
  destinationAddress = "Bulevar oslobodjenja fsafas asfasfasf asfasfasfa asfasf asfasfas asfasfasf sa saf 30"
  rideEstTime = "1hr 15min"
  rideLength = "55km"
  @Input() currentRide?:RideInfo;
  @Input() rideLengthKm?:number;
  @Input() distanceLeftChangedEvent?:Observable<number>;

  ngOnInit(): void {
    this.destinationAddress = this.currentRide!.locations[0].destination.address;
    this.departureAddress = this.currentRide!.locations[0].departure.address;
    const estTimeMinutes:number = this.currentRide!.estimatedTimeInMinutes;
    const hours:number = Math.floor(estTimeMinutes / 60);
    const minutes:number = estTimeMinutes % 60;
    if(hours == 0){
      this.rideEstTime = `${minutes}min`;
    }else{
      this.rideEstTime = `${hours}hr ${minutes}min`;
    }
    this.rideLength = `${this.rideLengthKm}km`;
    this.distanceLeftChangedEvent?.subscribe(distance => {
      console.log(`Total distance: ${this.rideLengthKm} ------> Distance left: ${distance}`);
      const ridePercent:number = Math.ceil((1 - (distance / this.rideLengthKm!)) * 100);
      this.progressBarHeight = `${ridePercent}%`;
    });
  }
}
