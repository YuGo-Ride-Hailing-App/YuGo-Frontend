import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../../enviroments/environment";
import {FavoritePathInfo} from "../../feature/favorite-path/models/FavoritePathInfo";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class FavoritePathService {

  constructor(private http: HttpClient) { }

  getFavoritePaths():Observable<FavoritePathInfo[]>{
    return this.http.get<FavoritePathInfo[]>(environment.apiHost + `ride/favorites`);
  }

  deleteFavoritePath(id:number):Observable<any>{
    return this.http.delete<any>(environment.apiHost+`ride/favorites/${id}`);
  }
  addFavoritePath(values:any):Observable<any>{
    return this.http.post(environment.apiHost + `ride/favorites`, values);
  }
}
