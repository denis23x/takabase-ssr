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
import { AuthService, RequestHeaders, User } from '../../core';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
	constructor(private authService: AuthService) {}

	private getToken(): string | undefined {
		const user: User = this.authService.user.getValue();

		return user?.token;
	}

	private setRequestHeaders(request: HttpRequest<any>): HttpRequest<any> {
		const requestHeaders: RequestHeaders = {};

		const token: string = this.getToken();

		if (!!token) {
			requestHeaders['Authorization'] = 'Bearer ' + token;
		}

		return request.clone({
			setHeaders: requestHeaders,
			withCredentials: true
		});
	}

	// prettier-ignore
	private handleResponseError(httpErrorResponse: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if ([401].includes(httpErrorResponse.status)) {
      if (!request.url.endsWith('auth/refresh')) {
        return this.authService
          .onRefresh()
          .pipe(switchMap(() => next.handle(this.setRequestHeaders(request))));
      }
    }

    return throwError(() => httpErrorResponse);
  }

	// prettier-ignore
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(this.setRequestHeaders(request)).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				const token: string = this.getToken();

				if (!!token) {
					return this.handleResponseError(httpErrorResponse, request, next);
				}

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
