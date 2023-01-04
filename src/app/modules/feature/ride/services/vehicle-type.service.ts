import { Injectable } from '@angular/core';
import {environment} from "../../../../../enviroments/environment";
import {HttpClient} from "@angular/common/http";
import {VehicleType, VehicleTypeCardData} from "../components/vehicle-type-card/vehicle-type-card.component";
import {ImageService} from "../../../core/services/image.service";

@Injectable({
  providedIn: 'root'
})
export class VehicleTypeService {

  constructor(private http:HttpClient, private imageService:ImageService) { }
  getVehicleTypes():Promise<VehicleType[]>{
    return new Promise<VehicleType[]>( resolve => {
      this.http.get<VehicleType[]>(environment.apiHost + 'vehicleType').subscribe(
        (vehicleTypes:VehicleType[]) =>{
          resolve(vehicleTypes);
          // for(let vehicleType of vehicleTypes){
          //   this.imageService.getImage(vehicleType.imgPath).then(resp => {
          //     let totalPrice:number = Math.round(distance * vehicleType.pricePerKm * 100) / 100;
          //     let vehicleTypeCardData:VehicleTypeCardData = {
          //       id: vehicleType.id,
          //       image: resp,
          //       totalPrice: totalPrice,
          //       vehicleTypeName: vehicleType.vehicleType
          //     }
          //     output.push(vehicleTypeCardData);
          //   });
          // }
        }
      );
    });
  }

}
