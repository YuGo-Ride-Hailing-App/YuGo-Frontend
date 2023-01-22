import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../../enviroments/environment";
import {UsersInfoPaged} from "../../feature/account/models/UsersInfoPaged";
import {UserInfo} from "../models/UserInfo";
import {UserSimpleInfo} from "../models/UserSimpleInfo";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(userId : number, role: string) : Observable<UserInfo>{
    role = role.toLowerCase();
    return this.http.get<UserInfo>(environment.apiHost + `${role}/${userId}`);
  }

  getUserByEmail(email : string) : Observable<UserSimpleInfo>{
    return this.http.get<UserSimpleInfo>(environment.apiHost + `user/${email}/email` );
  }

  resetPasswordWithCode(code:number,password:string):Observable<any>{
    return  this.http.put(environment.apiHost+`user/resetPassword`,{"code":code,"newPassword":password})
  }
  sendPasswordCode(id:number):Observable<any>{
    return this.http.get<any>(environment.apiHost+`user/${id}/resetPassword`)
  }
  sendPasswordCodeEfficient(email:string):Observable<any>{
    return this.http.post<any>(environment.apiHost+`user/${email}/resetPassword`,{})
  }

  updateUser(userId : number, role: string, values: any) : Observable<UserInfo>{
    role = role.toLowerCase();
    return this.http.put<UserInfo>(environment.apiHost + `${role}/${userId}`, values);
  }

  getUsers(page : number, size :number): Observable<UsersInfoPaged>{
    return this.http.get<UsersInfoPaged>(environment.apiHost + "user",
      {params : {
        page: page,
        size : size
      }});
  }

  changePassword(userId :number, passwordForm: any): Observable<any>{
    return this.http.put<any>(environment.apiHost + `user/${userId}/changePassword`,passwordForm)
  }

  blockUser(userId : number) : Observable<any>{
    return this.http.put<any>(environment.apiHost + `user/${userId}/block`, {});
  }

  unblockUser(userId : number) : Observable<any>{
    return this.http.put(environment.apiHost + `user/${userId}/unblock`, {});
  }

  createNote(userId : number, note : string) : Observable<any>{
    return this.http.post(environment.apiHost + `user/${userId}/note`, {"message":note});
  }

  getNotes(userId : number, page : number, size :number) : Observable<any>{
    return this.http.get(environment.apiHost + `user/${userId}/note`,
      {params : {
          page: page,
          size : size
        }});
  }
}
