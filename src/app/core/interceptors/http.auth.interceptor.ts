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
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
	constructor(private authService: AuthService) {}

	private handleRequest(request: HttpRequest<any>): HttpRequest<any> {
		// prettier-ignore
		const isMethodMatch: boolean = ['POST', 'PUT', 'DELETE'].includes(request.method);
		const isUrlMatch: boolean = request.url.startsWith(environment.API_URL);

		if (isMethodMatch && isUrlMatch) {
			const user: User = this.authService.user.getValue();

			if (user && user.bearer) {
				return request.clone({
					setHeaders: {
						['Authorization']: 'Bearer ' + user.bearer
					},
					withCredentials: false
				});
			}

			return request;
		}

		return request;
	}

	// prettier-ignore
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.handleRequest(request)).pipe(
      catchError((httpErrorResponse: HttpErrorResponse) => {
        return throwError(() => httpErrorResponse);
      })
    );
  }
}
