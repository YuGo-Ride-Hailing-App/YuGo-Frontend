import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {JwtHelperService} from "@auth0/angular-jwt";
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";

@Injectable()
export class Interceptor implements HttpInterceptor {
  constructor(private _router: Router, private _authService: AuthService) {
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const accessToken: any = localStorage.getItem('token');

    if (req.headers.get('skip')){
      const cloned = req.clone({headers: req.headers.delete('skip')})
      return next.handle(cloned);
    }

    if (accessToken) {
      const helper = new JwtHelperService();
      const tokenType = helper.decodeToken(accessToken).type;
      const cloned = req.clone({
        headers: req.headers.set('authorization', tokenType + " " + accessToken),
      });

      return next.handle(cloned).pipe(
        catchError((error) => {
          if (error instanceof HttpErrorResponse &&
            !cloned.url.includes('user/login') &&
            error.status == 401) {
              this.handle401Error();
          }
          return throwError(() => error);
        })
      );
    } else {
      return next.handle(req);
    }
  }

  private isRefreshing = false;
  private handle401Error() {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      if (this._authService.isLoggedIn()) {
        this._authService.refreshToken().subscribe({
          next: (result) => {
            this.isRefreshing = false;
            localStorage.setItem("token", result.accessToken);
            localStorage.setItem("refreshToken", result.refreshToken);
            window.location.reload();
          },
          error: (error) => {
            this.isRefreshing = false;
            if (error instanceof HttpErrorResponse) {
              if (error.status == 403 || error.status == 404) {
                localStorage.clear();
                this._authService.setUser();
                this._router.navigate(['/']);
              }
            }
          }
        });
      }
    }
  }
}
