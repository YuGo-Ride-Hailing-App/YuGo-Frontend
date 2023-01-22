import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";
import {RideInfo} from "../../../shared/models/RideInfo";
import {Coordinates} from "../model/Coordinates";

@Injectable({
  providedIn: 'root'
})
export class PassengerRideNotificationsService {


  private rideSearchCompletedPublisher:Subject<RideInfo> = new Subject<RideInfo>();
  rideSearchCompleteSubscriber:Observable<RideInfo> = this.rideSearchCompletedPublisher.asObservable();

  private driverLocationPublisher:Subject<Coordinates> = new Subject<Coordinates>();
  public driverLocationSubscriber:Observable<Coordinates> = this.driverLocationPublisher.asObservable();

  rideAcceptedEvent:Subject<RideInfo> = new Subject<RideInfo>();
  startRideEvent:Subject<RideInfo> = new Subject<RideInfo>();
  endRideEvent:Subject<RideInfo> = new Subject<RideInfo>();

  updateDriverLocation(coordinates:Coordinates){
    this.driverLocationPublisher.next(coordinates);
  }

  rideSearchCompleted(ride: RideInfo){
    this.rideSearchCompletedPublisher.next(ride);
  }
}
