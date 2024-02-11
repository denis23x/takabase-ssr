/** @format */

import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';
import { FirebaseError } from '@angular/fire/app';

@Injectable({
	providedIn: 'root'
})
export class ApiService {
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	setUrl(url: string): string {
		return environment.apiUrl + url;
	}

	setError(error: any): Observable<never> {
		const defaultMessage: string = 'Oops! Something went wrong. Try again later';

		const getMessage = (): string => {
			switch (true) {
				case error instanceof HttpErrorResponse: {
					return error.error.message;
				}
				case error instanceof FirebaseError: {
					/** https://codinglatte.com/posts/angular/handling-firebase-password-resets-in-angular/ */

					switch (error.code) {
						case 'auth/invalid-action-code':
							return 'Invalid confirmation code';
						case 'auth/invalid-login-credentials':
							return 'Invalid email or password credentials';
						case 'auth/network-request-failed':
							return 'Please check your internet connection';
						case 'auth/too-many-requests':
							return 'We have detected too many requests from your device. Take a break please!';
						case 'auth/user-disabled':
							return 'Your account has been disabled or deleted. Please contact support team';
						case 'auth/requires-recent-login':
							return 'Please login again and try again!';
						case 'auth/email-already-in-use':
							return 'Email address is already in use by an existing user';
						case 'auth/user-not-found':
							return 'We could not find user account associated with the email address';
						case 'auth/invalid-credential':
							return 'Invalid email or password credentials';
						case 'auth/invalid-email':
							return 'The email address is not a valid email address!';
						case 'auth/missing-email':
							return 'Missing credentials. Please provide the email to proceed.';
						case 'auth/missing-password':
							return 'Missing credentials. Please provide the password to proceed.';
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

		this.snackbarService.error('Error', getMessage(), {
			icon: 'bug',
			duration: 6000
		});

		return throwError(() => error);
	}

	get(url: string, params?: any, options?: any): Observable<any> {
		return this.httpClient.get(this.setUrl(url), { ...options, params }).pipe(
			map((response: any) => response.data || response),
			catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse))
		);
	}

	put(url: string, body: any, options?: any): Observable<any> {
		return this.httpClient.put(this.setUrl(url), body, options).pipe(
			map((response: any) => response.data || response),
			catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse))
		);
	}

	post(url: string, body: any, options?: any): Observable<any> {
		return this.httpClient.post(this.setUrl(url), body, options).pipe(
			map((response: any) => response.data || response),
			catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse))
		);
	}

	delete(url: string, params?: any): Observable<any> {
		return this.httpClient.delete(this.setUrl(url), { params }).pipe(
			map((response: any) => response.data || response),
			catchError((httpErrorResponse: HttpErrorResponse) => this.setError(httpErrorResponse))
		);
	}
}
