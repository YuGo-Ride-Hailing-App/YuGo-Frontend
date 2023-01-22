import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";
import {RideInfo} from "../../../shared/models/RideInfo";
import {Coordinates} from "../model/Coordinates";

@Injectable({
  providedIn: 'root'
})
export class PassengerRideNotificationsService {

  constructor() { }

  driverLocationUpdatedEvent:Subject<Coordinates> = new Subject<Coordinates>();

  rideAcceptedEvent:Subject<RideInfo> = new Subject<RideInfo>();
  rideRejectedEvent:Subject<RideInfo> = new Subject<RideInfo>();
  startRideEvent:Subject<RideInfo> = new Subject<RideInfo>();
  endRideEvent:Subject<RideInfo> = new Subject<RideInfo>();

}
