import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../enviroments/environment";
import {Vehicle} from "../models/Vehicle";
import {VehicleChangeRequest} from "../../feature/vehicle/model/VehicleChangeRequest";
import {VehicleChangeRequestsPaged} from "../../feature/vehicle/model/VehicleChangeRequestsPaged";

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  constructor(private http: HttpClient) {
  }

  getVehicle(driverId : number) : Observable<Vehicle>{
    return this.http.get<Vehicle>(environment.apiHost + `driver/${driverId}/vehicle`);
  }
  makeVehicleChangeRequest(driverId : number, vehicle : Vehicle) : Observable<any>{
    return this.http.post<any>(environment.apiHost + `vehicle/${driverId}/makeRequest`, vehicle)
  }
  getVehicleChangeRequests(page: number, size: number) : Observable<VehicleChangeRequestsPaged>{
    return this.http.get<VehicleChangeRequestsPaged>(environment.apiHost + `vehicle/changeRequests`,
      {params : {
          page: page,
          size : size
        }})
  }
  acceptVehicleChangeRequest(requestId: number): Observable<any>{
    return this.http.post<any>(environment.apiHost + `vehicle/${requestId}/acceptRequest`, {})
  }
  rejectVehicleChangeRequest(requestId: number): Observable<any>{
    return this.http.post<any>(environment.apiHost + `vehicle/${requestId}/rejectRequest`, {})
  }
}