/** @format */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';
import { ApiError } from '../models';

@Injectable()
export class ApiService {
  constructor(private http: HttpClient, private snackbarService: SnackbarService) {}

  getErrorSnack(response: HttpErrorResponse) {
    const getMessage = (error: ApiError): string => {
      switch (typeof error.message) {
        case 'string':
          return String(error.message);
        case 'object':
          return String(error.message.join(', '));
        default:
          return 'Unknown error';
      }
    };

    const getTimeout = (error: ApiError): number => {
      return typeof error.message === 'object' ? error.message.length * 4000 : 5000;
    };

    this.snackbarService.danger('Error', getMessage(response.error), getTimeout(response.error));

    return throwError(response);
  }

  get(path: string, params?: any): Observable<any> {
    return this.http
      .get(environment.API_URL + path, { params })
      .pipe(catchError(error => this.getErrorSnack(error)));
  }

  put(path: string, body?: any): Observable<any> {
    return this.http
      .put(environment.API_URL + path, JSON.stringify(body || {}))
      .pipe(catchError(error => this.getErrorSnack(error)));
  }

  post(path: string, body?: any): Observable<any> {
    return this.http
      .post(environment.API_URL + path, JSON.stringify(body || {}))
      .pipe(catchError(error => this.getErrorSnack(error)));
  }

  delete(path: string): Observable<any> {
    return this.http
      .delete(environment.API_URL + path)
      .pipe(catchError(error => this.getErrorSnack(error)));
  }
}
