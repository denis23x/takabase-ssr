/** @format */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';
import { RequestError } from '../models';
import { Router } from '@angular/router';

@Injectable()
export class ApiService {
	constructor(
		private httpClient: HttpClient,
		private snackbarService: SnackbarService,
		private router: Router
	) {}

	setUrl(url: string): string {
		return environment.API_URL + url;
	}

	setError(httpErrorResponse: HttpErrorResponse): Observable<never> {
		if ([401].includes(httpErrorResponse.status)) {
			if (httpErrorResponse.url.endsWith('auth/refresh')) {
				this.router
					.navigate(['/exception', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));
			}
		}

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
			return typeof requestError.message === 'object'
				? requestError.message.length * 4000
				: 4000;
		};

		// prettier-ignore
		this.snackbarService.danger('Error', getMessage(httpErrorResponse.error), getDuration(httpErrorResponse.error));

		return throwError(() => httpErrorResponse);
	}

	get(url: string, params?: any, options?: any): Observable<any> {
		return this.httpClient.get(this.setUrl(url), { ...options, params }).pipe(
			map((response: any) => response.data || response),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.setError(httpErrorResponse);
			})
		);
	}

	put(url: string, body: any, options?: any): Observable<any> {
		return this.httpClient.put(this.setUrl(url), body, options).pipe(
			map((response: any) => response.data || response),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.setError(httpErrorResponse);
			})
		);
	}

	post(url: string, body: any, options?: any): Observable<any> {
		return this.httpClient.post(this.setUrl(url), body, options).pipe(
			map((response: any) => response.data || response),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.setError(httpErrorResponse);
			})
		);
	}

	delete(url: string, params?: any): Observable<any> {
		return this.httpClient.delete(this.setUrl(url), { params }).pipe(
			map((response: any) => response.data || response),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.setError(httpErrorResponse);
			})
		);
	}
}
