/** @format */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, pluck } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';
import { RequestError, RequestBody, RequestParams } from '../models';

@Injectable()
export class ApiService {
  constructor(private httpClient: HttpClient, private snackbarService: SnackbarService) {}

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
    return this.httpClient.get(environment.API_URL + path, { params: requestParams }).pipe(
      pluck('data'),
      catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse))
    );
  }

  put(path: string, requestBody?: RequestBody): Observable<any> {
    return this.httpClient.put(environment.API_URL + path, JSON.stringify(requestBody || {})).pipe(
      pluck('data'),
      catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse))
    );
  }

  post(path: string, requestBody?: RequestBody): Observable<any> {
    return this.httpClient.post(environment.API_URL + path, JSON.stringify(requestBody || {})).pipe(
      pluck('data'),
      catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse))
    );
  }

  post2(path: string, requestBody?: RequestBody): Observable<any> {
    return this.httpClient.post(environment.API_URL + path, requestBody).pipe(pluck('data'));
  }

  delete(path: string): Observable<any> {
    return this.httpClient.delete(environment.API_URL + path).pipe(
      pluck('data'),
      catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse))
    );
  }
}
