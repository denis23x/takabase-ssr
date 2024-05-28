/** @format */

import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';
import { FirebaseError } from 'firebase/app';

@Injectable({
	providedIn: 'root'
})
export class ApiService {
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	setUrl(url: string): string {
		return environment.apiUrl + url;
	}

	/** ERROR */

	setFirebaseError(firebaseError: FirebaseError): Observable<never> {
		/** https://firebase.google.com/docs/auth/admin/errors */
		/** https://codinglatte.com/posts/angular/handling-firebase-password-resets-in-angular/ */
		/** https://github.com/firebase/firebase-js-sdk/blob/master/packages/firestore/src/util/error.ts */
		/** https://firebase.google.com/docs/storage/web/handle-errors */

		console.debug(firebaseError.code);

		/** STORAGE && FIRESTORE && AUTH */

		const getMessage = (): string => {
			switch (firebaseError.code) {
				case 'storage/unauthorized':
					return "You don't have permissions to access";
				case 'permission-denied':
					return "You don't have permissions to access";
				case 'not-found':
					return 'No document to update';
				case 'auth/invalid-action-code':
					return 'Invalid confirmation code';
				case 'auth/invalid-login-credentials':
					return 'Invalid email or password credentials';
				case 'auth/network-request-failed':
					return 'Please check your internet connection';
				case 'auth/too-many-requests':
					return 'Detected too many requests from your device. Take a break please!';
				case 'auth/user-disabled':
					return 'Your account has been disabled or deleted. Please contact support team';
				case 'auth/requires-recent-login':
					return 'Please login again and try again';
				case 'auth/email-already-in-use':
					return 'Email address is already in use by an existing user';
				case 'auth/user-not-found':
					return 'Not found any user account associated with the email address';
				case 'auth/invalid-credential':
					return 'Invalid email or password credentials';
				case 'auth/invalid-email':
					return 'The email address is not a valid email address';
				case 'auth/missing-email':
					return 'Missing credentials. Please provide the email to proceed.';
				case 'auth/missing-password':
					return 'Missing credentials. Please provide the password to proceed.';
				case 'auth/cannot-delete-own-user-account':
					return 'You cannot delete your own user account';
				default:
					return 'Sorry, something unexpected occurred';
			}
		};

		const message: string = getMessage();

		this.snackbarService.error('Firebase', message, {
			icon: 'database',
			duration: 6000
		});

		return throwError(() => firebaseError);
	}

	setHttpErrorResponse(httpErrorResponse: HttpErrorResponse): Observable<never> {
		/** https://github.com/denis23x/takabase-dd */

		console.debug(httpErrorResponse.error.code);

		/** FASTIFY */

		const getMessage = (): string | undefined => {
			switch (httpErrorResponse.error.code) {
				case 'firestore/add-document-failed':
					return 'Failed to add document';
				case 'firestore/get-document-failed':
					return 'Failed to get document';
				case 'firestore/get-list-failed':
					return 'Failed to get list of documents';
				case 'firestore/update-document-failed':
					return 'Failed to update document';
				case 'firestore/delete-document-failed':
					return 'Failed to delete document';
				case 'storage/get-filelist-failed':
					return 'Failed to get list of files';
				case 'storage/file-move-failed':
					return 'Failed to move the file inside the storage';
				default:
					return httpErrorResponse.error.message;
			}
		};

		const message: string = getMessage() || 'Something went wrong';

		this.snackbarService.error('Error', message, {
			icon: 'bug',
			duration: 6000
		});

		return throwError(() => httpErrorResponse);
	}

	/** REST */

	get(url: string, params?: any, options?: any): Observable<any> {
		return this.httpClient.get(this.setUrl(url), { ...options, params }).pipe(
			map((response: any) => response.data),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.setHttpErrorResponse(httpErrorResponse);
			})
		);
	}

	put(url: string, body?: any, options?: any): Observable<any> {
		return this.httpClient.put(this.setUrl(url), body, options).pipe(
			map((response: any) => response.data),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.setHttpErrorResponse(httpErrorResponse);
			})
		);
	}

	post(url: string, body?: any, options?: any): Observable<any> {
		return this.httpClient.post(this.setUrl(url), body, options).pipe(
			map((response: any) => response.data),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.setHttpErrorResponse(httpErrorResponse);
			})
		);
	}

	delete(url: string, params?: any): Observable<any> {
		return this.httpClient.delete(this.setUrl(url), { params }).pipe(
			map((response: any) => response.data),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.setHttpErrorResponse(httpErrorResponse);
			})
		);
	}
}
