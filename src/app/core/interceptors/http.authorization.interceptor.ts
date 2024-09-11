/** @format */

import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { from, Observable, switchMap } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { PlatformService } from '../services/platform.service';
import type { HttpRequest, HttpInterceptorFn, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import type { User as FirebaseUser } from 'firebase/auth';

// prettier-ignore
export const httpAuthorizationInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
	const platformService: PlatformService = inject(PlatformService);
	const firebaseService: FirebaseService = inject(FirebaseService);

	const isMethodMatch: boolean = ['POST', 'PUT', 'DELETE'].includes(request.method);
	const isUrlMatch: boolean = request.url.startsWith(environment.apiUrl);

	const isAuthenticatedArea: boolean = ['posts-bookmark', 'posts-password', 'posts-private'].some((url: string) => request.url.includes(url));
	const isAdminFunctions: boolean = ['algolia', 'insights', 'sitemap'].some((url: string) => request.url.includes(url));

	if (platformService.isBrowser()) {
		if ((isMethodMatch && isUrlMatch) || isAuthenticatedArea || isAdminFunctions) {
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
	}

	return next(request);
};
