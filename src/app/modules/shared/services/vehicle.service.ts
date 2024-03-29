import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../enviroments/environment";
import {Vehicle} from "../models/Vehicle";
import {VehicleChangeRequestsPaged} from "../../feature/vehicle/model/VehicleChangeRequestsPaged";
import {LocationInfo} from "../models/LocationInfo";
import {MessageSimplifiedInfo} from "../models/MessageSimplifiedInfo";

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  constructor(private http: HttpClient) {
  }

  getAllVehicles() : Observable<Vehicle[]>{
    return this.http.get<Vehicle[]>(environment.apiHost + `vehicle/vehicles`);
  }

  getVehicle(driverId : number) : Observable<Vehicle>{
    return this.http.get<Vehicle>(environment.apiHost + `driver/${driverId}/vehicle`);
  }
  updateVehicleLocation(vehicleID:number, location:LocationInfo) : Observable<void>{
    return this.http.put<void>(environment.apiHost + `vehicle/${vehicleID}/location`, location);
  }
  createVehicle(driverId : number, vehicle : Vehicle): Observable<Vehicle>{
    return this.http.post<Vehicle>(environment.apiHost + `driver/${driverId}/vehicle`, vehicle);
  }
  makeVehicleChangeRequest(driverId : number, vehicle : Vehicle) : Observable<MessageSimplifiedInfo>{
    return this.http.post<MessageSimplifiedInfo>(environment.apiHost + `vehicle/${driverId}/makeRequest`, vehicle)
  }
  getVehicleChangeRequests(page: number, size: number) : Observable<VehicleChangeRequestsPaged>{
    return this.http.get<VehicleChangeRequestsPaged>(environment.apiHost + `vehicle/changeRequests`,
      {params : {
          page: page,
          size : size
        }})
  }
  acceptVehicleChangeRequest(requestId: number): Observable<MessageSimplifiedInfo>{
    return this.http.post<MessageSimplifiedInfo>(environment.apiHost + `vehicle/${requestId}/acceptRequest`, {})
  }
  rejectVehicleChangeRequest(requestId: number): Observable<MessageSimplifiedInfo>{
    return this.http.post<MessageSimplifiedInfo>(environment.apiHost + `vehicle/${requestId}/rejectRequest`, {})
  }
}
