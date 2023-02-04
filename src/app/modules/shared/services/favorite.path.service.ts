import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../../enviroments/environment";
import {FavoritePathInfo} from "../../feature/favorite-path/models/FavoritePathInfo";
import {HttpClient} from "@angular/common/http";
import {CreateFavoriteRideDTO} from "../models/CreateFavoriteRideDTO";

@Injectable({
  providedIn: 'root'
})
export class FavoritePathService {

  constructor(private http: HttpClient) { }

  getFavoritePaths():Observable<FavoritePathInfo[]>{
    return this.http.get<FavoritePathInfo[]>(environment.apiHost + `ride/favorites`);
  }

  deleteFavoritePath(id:number):Observable<void>{
    return this.http.delete<void>(environment.apiHost+`ride/favorites/${id}`);
  }
  addFavoritePath(values:CreateFavoriteRideDTO):Observable<FavoritePathInfo>{
    return this.http.post<FavoritePathInfo>(environment.apiHost + `ride/favorites`, values);
  }
}
