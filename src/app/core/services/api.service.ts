/** @format */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';
import { RequestError } from '../models';

@Injectable()
export class ApiService {
  constructor(private httpClient: HttpClient, private snackbarService: SnackbarService) {}

  setUrl(url: string): string {
    return environment.API_URL + url;
  }

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

    return throwError(() => httpErrorResponse);
  }

  get(url: string, params?: any, options?: any): Observable<any> {
    return this.httpClient.get(this.setUrl(url), { ...options, params }).pipe(
      map((response: any) => response.data || response),
      catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse))
    );
  }

  put(url: string, body: any | null, options?: any): Observable<any> {
    return this.httpClient.put(this.setUrl(url), body, options).pipe(
      map((response: any) => response.data || response),
      catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse))
    );
  }

  post(url: string, body: any | null, options?: any): Observable<any> {
    return this.httpClient.post(this.setUrl(url), body, options).pipe(
      map((response: any) => response.data || response),
      catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse))
    );
  }

  delete(url: string): Observable<any> {
    return this.httpClient.delete(this.setUrl(url)).pipe(
      map((response: any) => response.data || response),
      catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse))
    );
  }
}
