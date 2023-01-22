import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../enviroments/environment";
import {Observable} from "rxjs";
import {DocumentInfo} from "../../shared/models/DocumentInfo";

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private http:HttpClient) { }
  getImage(imgPath:string):Promise<any>{
    return new Promise<any>(resolve => {
      this.http.get(environment.apiHost + `image/${imgPath}`, {observe:'response', responseType: 'blob'}).subscribe(resp => {
        resolve(resp.body);
      });
    });
  }

  createProfilePicture(userId: number, file: FormData):Observable<any>{
    return this.http.post<any>(environment.apiHost+`image/${userId}/profilePicture`,file);
  }

  getProfilePicture(pictureName: string) :Promise<any>{
    return new Promise<any>(resolve => {
      this.http.get(environment.apiHost+`image/profilePicture/${pictureName}`, {observe:'response', responseType: 'blob'}).subscribe(resp => {
        resolve(resp.body);
      });
    });
  }
}
