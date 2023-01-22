import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {catchError, map, Observable, of} from 'rxjs';
import {AuthService} from "../services/auth.service";
import {UserService} from "../../shared/services/user.service";

@Injectable({
  providedIn: 'root'
})
export class ProfileGuard implements CanActivate {
  paramUserId = -1;
  paramUserRole = "";
  constructor(private _authService: AuthService, private _userService: UserService, private _router: Router) {
  }

  userExists() : Observable<boolean>{
    return this._userService.getUser(this.paramUserId, this.paramUserRole).pipe(map(value => {
      if (value.role == this.paramUserRole){
        return true;
      }
      this._router.navigate(['/']);
      return false;
    }), catchError(() => {
      this._router.navigate(['/']);
      return of(false);
    }));
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    this.paramUserId = Number.parseInt(route.params['userId']);
    this.paramUserRole = route.params['role'];

    const currentUserRole = this._authService.getRole();
    const currentUserId = this._authService.getId();

    if (currentUserRole == this.paramUserRole && currentUserId == this.paramUserId){
      return true;
    }
    else if (currentUserRole == "ADMIN"){
      return this.userExists();
    }
    this._router.navigate(['/']);
    return false;
  }

}
