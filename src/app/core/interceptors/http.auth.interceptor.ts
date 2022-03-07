/** @format */

import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LocalStorageService } from '../services';
import { AuthService, RequestHeaders } from '../../core';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  constructor(private localStorageService: LocalStorageService, private authService: AuthService) {}

  private getToken(): string {
    return this.localStorageService.getItem(environment.TOKEN_LOCALSTORAGE);
  }

  private setRequestHeaders(request: HttpRequest<any>): HttpRequest<any> {
    const requestHeaders: RequestHeaders = {
      ['Content-Type']: 'application/json',
      ['Accept']: 'application/json'
    };

    const token: string = this.getToken();

    if (!!token) {
      requestHeaders['Authorization'] = 'Bearer ' + token;
    }

    return request.clone({
      setHeaders: requestHeaders,
      withCredentials: true
    });
  }

  // prettier-ignore
  private handleResponseError(error: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    switch (error.status) {
      case 401:
        return this.authService
          .onRefresh()
          .pipe(
            switchMap(() => next.handle(this.setRequestHeaders(request))),
            catchError((error: HttpErrorResponse) => {
              this.authService.removeAuthorization();

              return throwError(error);
          }));
      default:
        this.authService.removeAuthorization();

        return throwError(error);
    }
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.setRequestHeaders(request)).pipe(
      catchError((error: HttpErrorResponse) => {
        const token: string = this.getToken();

        if (!!token) {
          return this.handleResponseError(error, request, next);
        }

        return throwError(error);
      })
    );
  }
}
