/** @format */

import { Injectable } from '@angular/core';
import {
	HttpEvent,
	HttpInterceptor,
	HttpHandler,
	HttpRequest,
	HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthorizationService } from '../services/authorization.service';
import { environment } from '../../../environments/environment';
import { CurrentUser } from '../models/current-user.model';

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
	constructor(private authorizationService: AuthorizationService) {}

	private handleRequest(request: HttpRequest<any>): HttpRequest<any> {
		const isMethodMatch: boolean = ['POST', 'PUT', 'DELETE'].includes(request.method);
		const isUrlMatch: boolean = request.url.startsWith(environment.API_URL);

		if (isMethodMatch && isUrlMatch) {
			const currentUser: CurrentUser = this.authorizationService.currentUser.getValue();

			if (currentUser && currentUser.bearer) {
				return request.clone({
					setHeaders: {
						['Authorization']: 'Bearer ' + currentUser.bearer
					},
					withCredentials: false
				});
			}

			return request;
		}

		return request;
	}

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(this.handleRequest(request)).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return throwError(() => httpErrorResponse);
			})
		);
	}
}
