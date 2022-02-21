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

  private getRequestHeaders(request: HttpRequest<any>): HttpRequest<any> {
    const requestHeaders: RequestHeaders = {
      ['Content-Type']: 'application/json',
      ['Accept']: 'application/json'
    };

    const token = this.localStorageService.getItem(environment.TOKEN_LOCALSTORAGE);

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
          .pipe(switchMap(() => next.handle(this.getRequestHeaders(request))));
      case 403:
        this.authService.removeAuthorization();

        return throwError(error);
      default:
        return throwError(error);
    }
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.getRequestHeaders(request)).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleResponseError(error, request, next);
      })
    );
  }
}
