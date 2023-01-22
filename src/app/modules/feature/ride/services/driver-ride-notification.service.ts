import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subject, takeUntil, timer} from "rxjs";
import {Coordinates} from "../model/Coordinates";
import {DriverService} from "../../../shared/services/driver.service";
import {AuthService} from "../../../core/services/auth.service";
import {HttpClient} from "@angular/common/http";
import {RideInfo} from "../../../shared/models/RideInfo";
import {VehicleService} from "../../../shared/services/vehicle.service";
import {LocationInfo} from "../../../shared/models/LocationInfo";

@Injectable({
  providedIn: 'root'
})
export class DriverRideNotificationService {

  constructor(private driverService:DriverService, private authService:AuthService, private http:HttpClient, private vehicleService:VehicleService) { }
  private currentRide?:RideInfo;
  private nextRide?:RideInfo;

  currentDriverLocation:Subject<Coordinates> = new Subject<Coordinates>();    // triggered by this service while simulation is running or home component when page is loaded
  driverDestination:Subject<Coordinates> = new Subject<Coordinates>();        // triggered by this service when new route is created - the route is created either from current location to ride departure or from current location to ride destination
  currentRideChangedEvent:BehaviorSubject<RideInfo | undefined> =             // TODO kada se ucita stranica proveriti da li vozac ima aktivnu voznju, izmeniti BehaviorSubject u Subject
    new BehaviorSubject<RideInfo | undefined>(undefined);               // used to notify map component if driver is currently in ride
  private startRideEvent:Subject<void> = new Subject<void>();                 // triggered by map component when driver clicks begin ride button
  private endRideEvent:Subject<void> = new Subject<void>();                   // triggered by map component when driver clicks end ride button

  private async runSimulation(departure:Coordinates, destination:Coordinates){
    const headers = {'skip':'true'};
    this.vehicleService.getVehicle(this.authService.getId()).subscribe(vehicle => {
      let response:Observable<any> = this.http.get(`https://routing.openstreetmap.de/routed-car/route/v1/driving/${departure.longitude},${departure.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&overview=false&alternatives=true&steps=true`, {'headers':headers});
      response.subscribe(value => {
        let coordinates:any[] = [];
        for(let step of value.routes[0].legs[0].steps){
          coordinates = [...coordinates, ...step.geometry.coordinates]
        }
        let simulationEndEvent:Subject<void> = new Subject();
        timer(0,1000).pipe(takeUntil(simulationEndEvent), takeUntil(this.startRideEvent), takeUntil(this.endRideEvent))
          .subscribe(_ => {
            let newCoordsArr = coordinates.shift();
            if(!newCoordsArr){
              simulationEndEvent.next();
              return;
            }
            let coords:Coordinates = {
              latitude:newCoordsArr[1],
              longitude:newCoordsArr[0]
            }
            this.currentDriverLocation.next(coords);
            let updatedLocation:LocationInfo = {
              address:"some address",
              latitude:coords.latitude,
              longitude:coords.longitude
            }
            this.vehicleService.updateVehicleLocation(vehicle.id, updatedLocation).subscribe();
          });
      });
    });

  }

  startCurrentRide(){
    this.startRideEvent.next();
  }

  endCurrentRide(){
    this.endRideEvent.next();
    if(this.nextRide){
      this.currentRide = this.nextRide;
      this.nextRide = undefined;
      this.startRideSimulation(this.currentRide);
    }else {
      this.currentRide = undefined;
    }
    this.currentRideChangedEvent.next(this.currentRide);
  }

  queueRide(ride:RideInfo){
    if(!this.currentRide){
      this.currentRide = ride;
      this.currentRideChangedEvent.next(this.currentRide);
      this.startRideSimulation(ride);
    }else{
      this.nextRide = ride;
    }
  }

  private startRideSimulation(ride:RideInfo){
    let rideStartLocation:Coordinates = {
      latitude: ride.locations[0].departure.latitude,
      longitude: ride.locations[0].departure.longitude,
    }
    this.driverDestination.next(rideStartLocation);
    this.driverService.getLocation(this.authService.getId()).subscribe(currentLocation => {
      // Simulates the route from drivers current location to the ride departure
      this.runSimulation(currentLocation, rideStartLocation).then(() => {
        console.log("Driver arrived at ride departure");
      });
    });

    let rideEndLocation:Coordinates = {
      latitude: ride.locations[0].destination.latitude,
      longitude: ride.locations[0].destination.longitude,
    }
    this.startRideEvent.subscribe(() => {
      this.driverDestination.next(rideEndLocation);
      this.driverService.getLocation(this.authService.getId()).subscribe(currentLocation => {
        // Simulates the route from drivers current location to the ride destination
        this.runSimulation(currentLocation, rideEndLocation).then(() => {
          console.log("Driver arrived at ride destination");
        })
      });
    })
  }
}
