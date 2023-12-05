/** @format */

import { inject } from '@angular/core';
import { HttpRequest, HttpInterceptorFn, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { AuthorizationService } from '../services/authorization.service';
import { environment } from '../../../environments/environment';
import { CurrentUser } from '../models/current-user.model';
import { Observable } from 'rxjs';

// prettier-ignore
export const httpAuthorizationInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
	const authorizationService: AuthorizationService = inject(AuthorizationService);

	const isMethodMatch: boolean = ['POST', 'PUT', 'DELETE'].includes(request.method);
	const isUrlMatch: boolean = request.url.startsWith(environment.apiUrl);

	if (isMethodMatch && isUrlMatch) {
		const currentUser: CurrentUser = authorizationService.currentUser.getValue();

		if (currentUser && currentUser.bearer) {
			const requestClone: HttpRequest<unknown> = request.clone({
				setHeaders: {
					['Authorization']: 'Bearer ' + currentUser.bearer
				},
				withCredentials: false
			});

			return next(requestClone);
		}
	}

	return next(request);
};
