import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../../enviroments/environment";
import {HttpClient} from "@angular/common/http";
import {AllPanics} from "../../feature/panic/models/AllPanics";
import {Panic} from "../../feature/panic/models/Panic";

@Injectable({
  providedIn: 'root'
})
export class PanicService {
  constructor(private http: HttpClient) {

  }

  getPanics(page: number, size: number): Observable<AllPanics> {
    return this.http.get<AllPanics>(environment.apiHost + `panic`,
      {params : {
          page: page,
          size : size
        }});
  }

  getPanic(panicId: number): Observable<Panic> {
    return this.http.get<Panic>(environment.apiHost + `panic/${panicId}`);
  }
}
