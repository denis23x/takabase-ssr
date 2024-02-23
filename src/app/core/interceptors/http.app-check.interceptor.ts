/** @format */

import { inject } from '@angular/core';
import { HttpRequest, HttpInterceptorFn, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { from, Observable } from 'rxjs';
import {
	AppCheck,
	appCheckInstance$,
	AppCheckTokenResult,
	getToken
} from '@angular/fire/app-check';
import { switchMap } from 'rxjs/operators';
import { PlatformService } from '../services/platform.service';

// prettier-ignore
export const httpAppCheckInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
	const platformService: PlatformService = inject(PlatformService);

	const isMethodMatch: boolean = ['GET'].includes(request.method);
	const isUrlMatch: boolean = request.url.includes(environment.firebase.storageBucket);

	if (isMethodMatch && isUrlMatch) {
		if (platformService.isBrowser()) {
			return appCheckInstance$.pipe(
				switchMap((appCheck: AppCheck) => from(getToken(appCheck))),
				switchMap((appCheckTokenResult: AppCheckTokenResult) => {
					const requestClone: HttpRequest<unknown> = request.clone({
						setHeaders: {
							'X-Firebase-AppCheck': appCheckTokenResult.token
						}
					});

					return next(requestClone);
				})
			);
		}
	}

	return next(request);
};
