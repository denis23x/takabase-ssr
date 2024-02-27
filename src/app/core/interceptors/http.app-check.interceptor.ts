/** @format */

import { inject, NgZone } from '@angular/core';
import { HttpRequest, HttpInterceptorFn, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { from, Observable } from 'rxjs';
import { AppCheck, AppCheckTokenResult, getToken } from 'firebase/app-check';
import { switchMap } from 'rxjs/operators';
import { PlatformService } from '../services/platform.service';
import { FirebaseService } from '../services/firebase.service';

// prettier-ignore
export const httpAppCheckInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
	const platformService: PlatformService = inject(PlatformService);
	const firebaseService: FirebaseService = inject(FirebaseService);
	const ngZone: NgZone = inject(NgZone);

	const isMethodMatch: boolean = ['GET'].includes(request.method);
	const isUrlMatch: boolean = request.url.includes(environment.firebase.storageBucket);

	if (isMethodMatch && isUrlMatch) {
		if (platformService.isBrowser()) {

			/** Avoid https://angular.io/errors/NG0506 */

			return ngZone.runOutsideAngular(() => {
				const appCheck: AppCheck = firebaseService.getAppCheck();

				return from(getToken(appCheck)).pipe(switchMap((appCheckTokenResult: AppCheckTokenResult) => {
					const requestClone: HttpRequest<unknown> = request.clone({
						setHeaders: {
							'X-Firebase-AppCheck': appCheckTokenResult.token
						}
					});

					return next(requestClone);
				}));
			});
		}
	}

	return next(request);
};
