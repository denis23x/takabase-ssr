/** @format */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';
import { RequestError, RequestBody, RequestParams } from '../models';

@Injectable()
export class ApiService {
  constructor(private http: HttpClient, private snackbarService: SnackbarService) {}

  setError(httpErrorResponse: HttpErrorResponse): Observable<never> {
    const getMessage = (requestError: RequestError): string => {
      switch (typeof requestError.message) {
        case 'string':
          return String(requestError.message);
        case 'object':
          return String(requestError.message.join(', '));
        default:
          return 'Unknown error';
      }
    };

    const getDuration = (requestError: RequestError): number => {
      return typeof requestError.message === 'object' ? requestError.message.length * 4000 : 5000;
    };

    this.snackbarService.danger(getMessage(httpErrorResponse.error), {
      title: 'Error',
      duration: getDuration(httpErrorResponse.error)
    });

    return throwError(httpErrorResponse);
  }

  get(path: string, requestParams?: RequestParams): Observable<any> {
    return this.http
      .get(environment.API_URL + path, { params: requestParams })
      .pipe(catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse)));
  }

  put(path: string, requestBody?: RequestBody): Observable<any> {
    return this.http
      .put(environment.API_URL + path, JSON.stringify(requestBody || {}))
      .pipe(catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse)));
  }

  post(path: string, requestBody?: RequestBody): Observable<any> {
    return this.http
      .post(environment.API_URL + path, JSON.stringify(requestBody || {}))
      .pipe(catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse)));
  }

  delete(path: string): Observable<any> {
    return this.http
      .delete(environment.API_URL + path)
      .pipe(catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse)));
  }
}
