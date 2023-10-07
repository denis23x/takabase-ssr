/** @format */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';
import { Router } from '@angular/router';
import { FirebaseError } from '@angular/fire/app';

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

	setError(httpError: any): Observable<never> {
		// prettier-ignore
		const defaultMessage: string = 'Oops! Something went wrong. Try again later.';

		const getMessage = (): string => {
			switch (true) {
				case httpError instanceof HttpErrorResponse: {
					return httpError.error.message;
				}
				case httpError instanceof FirebaseError: {
					/** https://codinglatte.com/posts/angular/handling-firebase-password-resets-in-angular/ */

					switch (httpError.code) {
						case 'auth/invalid-login-credentials':
							return 'Invalid email or password credentials';
						case 'auth/network-request-failed':
							return 'Please check your internet connection';
						case 'auth/too-many-requests':
							return 'We have detected too many requests from your device. Take a break please!';
						case 'auth/user-disabled':
							return 'Your account has been disabled or deleted. Please contact the system administrator';
						case 'auth/requires-recent-login':
							return 'Please login again and try again!';
						case 'auth/email-already-exists':
							return 'Email address is already in use by an existing user';
						case 'auth/user-not-found':
							return 'We could not find user account associated with the email address';
						case 'auth/invalid-email':
							return 'The email address is not a valid email address!';
						case 'auth/cannot-delete-own-user-account':
							return 'You cannot delete your own user account';
						default:
							return defaultMessage;
					}
				}
				default: {
					return defaultMessage;
				}
			}
		};

		this.snackbarService.danger('Error', getMessage(), {
			icon: 'bug',
			duration: 6000
		});

		return throwError(() => httpError);
	}

	setErrorRedirect(httpErrorResponse: any): Observable<any> {
		return from(
			this.router
				.navigate(['/error', httpErrorResponse.status])
				.then(() => this.setError(httpErrorResponse))
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
