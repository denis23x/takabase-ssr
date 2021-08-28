/** @format */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';
import { ApiError } from '../models';

@Injectable()
export class ApiService {
  private api = environment.api_url;

  constructor(private http: HttpClient, private notificationService: SnackbarService) {}

  getErrorNotification(response: HttpErrorResponse) {
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

    this.notificationService.danger(
      'Error',
      getMessage(response.error),
      getTimeout(response.error)
    );

    return throwError(response);
  }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http
      .get(this.api + path, { params })
      .pipe(catchError(error => this.getErrorNotification(error)));
  }

  put(path: string, body: object): Observable<any> {
    return this.http
      .put(this.api + path, JSON.stringify(body))
      .pipe(catchError(error => this.getErrorNotification(error)));
  }

  post(path: string, body: object): Observable<any> {
    return this.http
      .post(this.api + path, JSON.stringify(body))
      .pipe(catchError(error => this.getErrorNotification(error)));
  }

  delete(path: string): Observable<any> {
    return this.http
      .delete(this.api + path)
      .pipe(catchError(error => this.getErrorNotification(error)));
  }
}
