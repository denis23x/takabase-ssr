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
import { environment } from '../../../environments/environment';

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
	setRequestWithCredentials(request: HttpRequest<any>): HttpRequest<any> {
		if (request.url.startsWith(environment.API_URL)) {
			return request.clone({
				withCredentials: true
			});
		}

		return request;
	}

	// prettier-ignore
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(this.setRequestWithCredentials(request)).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
        return throwError(() => httpErrorResponse);
			})
		);
	}
}
