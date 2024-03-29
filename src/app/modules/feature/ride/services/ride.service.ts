import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {RideBooking} from "../model/RideBooking";
import {RideInfo} from "../../../shared/models/RideInfo";
import {environment} from "../../../../../enviroments/environment";
import {Observable, } from "rxjs";
import {Panic} from "../../panic/models/Panic";

@Injectable({
  providedIn: 'root'
})
export class RideService {

  constructor(private http:HttpClient) { }

  currentRide?:RideInfo;

  notifyPassengersThatVehicleHasArrived(rideID:number):Observable<void>{
    return this.http.post<void>(environment.apiHost + `ride/vehicle-arrived/${rideID}`, {});
  }
  getActivePassengerRide(passengerID:number):Observable<RideInfo>{
    return this.http.get<RideInfo>(environment.apiHost + `ride/passenger/${passengerID}/active`);
  }
  createPanic(rideID:number, message:{reason:string}):Observable<Panic>{
    return this.http.put<Panic>(environment.apiHost + `ride/${rideID}/panic`, message);
  }
  createRide(ride:RideBooking):Observable<RideInfo>{
    return this.http.post<RideInfo>(environment.apiHost + 'ride', ride);
  }
  cancelRide(rideID:number):Observable<RideInfo>{
    return this.http.put<RideInfo>(environment.apiHost + `ride/${rideID}/withdraw`, {});
  }
  getUnresolvedRide(userID:number):Observable<RideInfo>{
    return this.http.get<RideInfo>(environment.apiHost + `ride/passenger/${userID}/unresolved`);
  }
  getRide(rideID:number):Observable<RideInfo>{
    return this.http.get<RideInfo>(environment.apiHost + "ride/" + rideID);
  }
  startRide(rideID:number):Observable<RideInfo>{
    return this.http.put<RideInfo>(`${environment.apiHost}ride/${rideID}/start`, {});
  }
  endRide(rideID:number):Observable<RideInfo>{
    return this.http.put<RideInfo>(`${environment.apiHost}ride/${rideID}/end`, {});
  }
  acceptRide(rideID:number):Observable<RideInfo>{
    return this.http.put<RideInfo>(environment.apiHost + "ride/"+ rideID+"/accept", {});
  }
  rejectRide(rideID:number, rejectionReason:string):Observable<RideInfo>{
    return this.http.put<RideInfo>(environment.apiHost + "ride/" + rideID + "/cancel", {reason:rejectionReason});
  }
  getDriverActiveRide(driverId: number): Observable<RideInfo>{
    return this.http.get<RideInfo>(environment.apiHost + `ride/driver/${driverId}/active`)
  }
}
