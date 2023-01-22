import { Injectable } from '@angular/core';
import {map, Observable} from "rxjs";
import {UserInfo} from "../models/UserInfo";
import {environment} from "../../../../enviroments/environment";
import {HttpClient} from "@angular/common/http";
import {RidesPaged} from "../../feature/history/models/RidesPaged";
import {DocumentInfo} from "../models/DocumentInfo";
import {LocationInfo} from "../models/LocationInfo";
import {Vehicle} from "../models/Vehicle";

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  constructor(private http: HttpClient) {

  }

  getLocation(userId: number):Observable<LocationInfo>{
    return this.http.get<Vehicle>(environment.apiHost + `driver/${userId}/vehicle`).pipe(map(vehicle => vehicle.currentLocation));
  }

  getDriver(userId: number): Observable<UserInfo> {
    return this.http.get<UserInfo>(environment.apiHost + `driver/${userId}`);
  }

  getDriverRides(passengerId: number, page: number, size: number, sort: string, from: string, to: string): Observable<RidesPaged> {
    return this.http.get<RidesPaged>(environment.apiHost + `driver/${passengerId}/ride`,
      {
        params: {
          page: page,
          size: size,
          sort: sort,
          from: from,
          to: to
        }
      });
  }

  createDocument(driverId: number, file: FormData, type: String):Observable<DocumentInfo>{
    return this.http.post<DocumentInfo>(environment.apiHost+`driver/${driverId}/document/${type}`,file);
  }

  getDocuments(driverId:number):Observable<DocumentInfo[]>{
    return this.http.get<DocumentInfo[]>(environment.apiHost+`driver/${driverId}/documents`);
  }

  deleteDocuments(documentId:number):Observable<any>{
    return this.http.delete<any>(environment.apiHost+`driver/document/${documentId}`);
  }

}
