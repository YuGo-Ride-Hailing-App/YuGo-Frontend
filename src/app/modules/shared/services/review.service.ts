import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../../enviroments/environment";
import {HttpClient} from "@angular/common/http";
import {ReviewPerPassengerInfo} from "../../feature/history/models/ReviewPerPassengerInfo";

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  constructor(private http: HttpClient) { }

  getReviewsForRide(rideId:number): Observable<ReviewPerPassengerInfo[]> {
    return this.http.get<ReviewPerPassengerInfo[]>(environment.apiHost + `review/${rideId}`);
  }
  createVehicleReview(rideId : number,rating:number,comment:string):Observable<any>{
    return this.http.post(environment.apiHost + `review/${rideId}/vehicle`, {"rating":rating,"comment":comment});
  }
  createRideReview(rideId : number,rating:number,comment:string):Observable<any>{
    return this.http.post(environment.apiHost + `review/${rideId}/driver`, {"rating":rating,"comment":comment});
  }
}
