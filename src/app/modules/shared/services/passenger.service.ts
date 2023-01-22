import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {UserInfo} from "../models/UserInfo";
import {environment} from "../../../../enviroments/environment";
import {RidesPaged} from "../../feature/history/models/RidesPaged";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PassengerService {
  constructor(private http: HttpClient) {

  }

  getPassenger(userId:number):Observable<UserInfo>{
    return this.http.get<UserInfo>(environment.apiHost + `passenger/${userId}`);
  }

  createPassenger(values: any) : Observable<UserInfo>{
    return this.http.post<UserInfo>(environment.apiHost + `passenger`, values);
  }

  getPassengerRides(passengerId:number, page : number, size :number, sort: string, from: string, to:string): Observable<RidesPaged>{
    return this.http.get<RidesPaged>(environment.apiHost + `passenger/${passengerId}/ride`,
      {params : {
          page: page,
          size : size,
          sort :sort,
          from :from,
          to: to
        }});
  }
  activatePassenger(code:number): Observable<any>{
    return this.http.get(environment.apiHost+`passenger/activate/${code}`);
  }
}
