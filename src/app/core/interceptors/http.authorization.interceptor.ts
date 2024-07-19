/** @format */

import { inject } from '@angular/core';
import { HttpRequest, HttpInterceptorFn, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { from, Observable, switchMap } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import type { User as FirebaseUser } from 'firebase/auth';

// prettier-ignore
export const httpAuthorizationInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
	const firebaseService: FirebaseService = inject(FirebaseService);

	const isMethodMatch: boolean = ['POST', 'PUT', 'DELETE'].includes(request.method);
	const isUrlMatch: boolean = request.url.startsWith(environment.apiUrl);

	if (isMethodMatch && isUrlMatch) {
		const firebaseUser: FirebaseUser = firebaseService.auth.currentUser;

		if (firebaseUser) {
			return from(firebaseUser.getIdToken()).pipe(
				switchMap((token: string) => {
					const requestClone: HttpRequest<unknown> = request.clone({
						setHeaders: {
							['Authorization']: 'Bearer ' + token
						},
						withCredentials: false
					});

					return next(requestClone);
				})
			);
		}
	}

	return next(request);
};
