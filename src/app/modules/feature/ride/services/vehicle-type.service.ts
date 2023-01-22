import { Injectable } from '@angular/core';
import {environment} from "../../../../../enviroments/environment";
import {HttpClient} from "@angular/common/http";
import {VehicleType} from "../components/vehicle-type-card/vehicle-type-card.component";
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
        }
      );
    });
  }

}
