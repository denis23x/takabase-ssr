/** @format */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class ApiService {
	constructor(
		private router: Router,
		private httpClient: HttpClient,
		private snackbarService: SnackbarService
	) {}

	setUrl(url: string): string {
		return environment.API_URL + url;
	}

	setError(httpErrorResponse: HttpErrorResponse): Observable<never> {
		const title: string = 'Error';

		const message = (): string => {
			const error: string | string[] = httpErrorResponse.error.message;

			if (typeof error === 'object') {
				return String(error.join(', '));
			}

			if (typeof error === 'string') {
				return String(error);
			}

			return 'Oops! Undefined error';
		};

		const duration = (): number => {
			const error: string | string[] = httpErrorResponse.error.message;

			if (typeof error === 'object') {
				return error.length * 4000;
			}

			return 4000;
		};

		this.snackbarService.danger(title, message(), duration());

		return throwError(() => httpErrorResponse);
	}

	// prettier-ignore
	setErrorRedirect(httpErrorResponse: Partial<HttpErrorResponse>): Observable<any> {
		return from(
			this.router
				.navigate(['/exception', httpErrorResponse.status])
				.then(() => this.setError(httpErrorResponse as HttpErrorResponse))
		);
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
