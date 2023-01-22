import {Component, EventEmitter, OnInit, Output,} from '@angular/core';
import {
  VehicleTypeCardData,
} from "../vehicle-type-card/vehicle-type-card.component";
import {Subject} from "rxjs";
import {VehicleTypeService} from "../../services/vehicle-type.service";
import {DestinationPickerService} from "../../services/destination-picker.service";
import {ImageService} from "../../../../core/services/image.service";
import {RideProperties} from "../../model/RideProperties";

@Component({
  selector: 'app-ride-pick-properties',
  templateUrl: './ride-pick-properties.component.html',
  styleUrls: ['./ride-pick-properties.component.css']
})
export class RidePickPropertiesComponent implements OnInit{
  @Output() changeFormPageEmitter = new EventEmitter<number>();
  @Output() ridePropertiesChangedEvent = new EventEmitter<RideProperties>();
  distanceChangedEvent:Subject<number> = new Subject<number>();
  includeBabies = false;
  includePets = false;
  vehicleTypes:VehicleTypeCardData[] = [];
  selectedVehicleType?:VehicleTypeCardData;
  changeCarTypeEvent:Subject<number> = new Subject<number>();
  estMinutes = 0;
  rideLength = 0;
  constructor(private vehicleTypeService:VehicleTypeService, private destinationPickerService:DestinationPickerService, private imageService:ImageService) {
  }
  ngOnInit():void{
    const data:VehicleTypeCardData[] = [];
    this.vehicleTypeService.getVehicleTypes().then(vehicleTypes => {
      for(const vehicleType of vehicleTypes){
        this.imageService.getImage(vehicleType.imgPath).then(resp => {
          const vehicleTypeCardData:VehicleTypeCardData = {
            id: vehicleType.id,
            image: resp,
            pricePerKm: vehicleType.pricePerKm,
            vehicleTypeName: vehicleType.vehicleType
          }
          data.push(vehicleTypeCardData);
        });
      }
    });
    this.vehicleTypes = data;
    this.destinationPickerService.path.subscribe((path) => {
      if(path){
        path.on('routesfound', (e:any) => {
          const routes = e.routes;
          const summary = routes[0].summary;
          this.rideLength = Math.round(summary.totalDistance * 100 / 1000) / 100;
          this.estMinutes = Math.round(summary.totalTime % 3600 * 100 / 60) / 100;
          this.distanceChangedEvent.next(this.rideLength);
        });
      }
    });

  }
  nextFormPage():void{
    this.ridePropertiesChangedEvent.emit({
      includeBabies:this.includeBabies,
      includePets:this.includePets,
      vehicleTypeId:this.selectedVehicleType!.id,
      vehicleTypeName:this.selectedVehicleType!.vehicleTypeName
    });
    this.changeFormPageEmitter.emit(1);
  }
  previousFormPage():void{
    this.changeFormPageEmitter.emit(-1);
  }
  changeVehicleType(index:number):void{
    this.changeCarTypeEvent.next(index);
    this.selectedVehicleType = this.vehicleTypes.at(index);
  }
}
