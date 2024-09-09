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

	// User authenticated area

	const isPostBookmark: boolean = request.url.includes('posts-bookmark');
	const isPostPassword: boolean = request.url.includes('posts-password');
	const isPostPrivate: boolean = request.url.includes('posts-private');

	// Admin functions

	const isAlgolia: boolean = request.url.includes('algolia');
	const isInsights: boolean = request.url.includes('insights');
	const isSitemap: boolean = request.url.includes('sitemap');

	if (platformService.isBrowser()) {
		if ((isMethodMatch && isUrlMatch) || (isPostBookmark || isPostPassword || isPostPrivate) || (isAlgolia || isInsights || isSitemap)) {
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
