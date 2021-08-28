/** @format */

import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { LocalStorageService, UserService } from '../services';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  constructor(private localStorageService: LocalStorageService, private userService: UserService) {}

  private getRequestHeaders(request: HttpRequest<any>): HttpRequest<any> {
    const headers: any = {
      ['Content-Type']: 'application/json',
      ['Accept']: 'application/json'
    };

    const token = this.localStorageService.getItem('accessToken');

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return request.clone({
      setHeaders: headers,
      withCredentials: true
    });
  }

  private handleResponseError(
    error: HttpErrorResponse,
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    switch (error.status) {
      case 401:
        return this.userService.getAuthentication('/auth/refresh', {}, false).pipe(
          switchMap(() => {
            return next.handle(this.getRequestHeaders(request));
          })
        );
      case 403:
        this.userService.removeAuthorization();

        return EMPTY;
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
