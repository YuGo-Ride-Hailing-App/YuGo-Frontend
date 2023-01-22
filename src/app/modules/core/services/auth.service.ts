import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import { environment } from 'src/enviroments/environment';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Token} from "../models/Token";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    skip: 'true',
  });

  user$ = new BehaviorSubject("");
  userState$ = this.user$.asObservable();

  constructor(private http: HttpClient) {
    this.user$.next(this.getRole());
  }

  logIn(auth: any): Observable<Token> {
    return this.http.post<Token>(environment.apiHost + 'user/login', auth, {
      headers: this.headers,
    });
  }

  logOut(): Observable<string> {
    return this.http.get(environment.apiHost + 'user/logout', {
      responseType: 'text',
    });
  }

  getRole(): string {
    if (this.isLoggedIn()) {
      const accessToken: any = localStorage.getItem('token');
      const helper = new JwtHelperService();
      return helper.decodeToken(accessToken).role;
    }
    return "UNREGISTERED";
  }

  getId(): number {
    if (this.isLoggedIn()) {
      const accessToken: any = localStorage.getItem('token');
      const helper = new JwtHelperService();
      return helper.decodeToken(accessToken).id;
    }
    return -1;
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('token') != null;
  }

  setUser(): void {
    this.user$.next(this.getRole());
  }

  refreshToken() : Observable<Token>{
    const refreshToken: any = localStorage.getItem('refreshToken');
    return this.http.post<any>(environment.apiHost + 'user/refreshToken', {"refreshToken": refreshToken});
  }
}
