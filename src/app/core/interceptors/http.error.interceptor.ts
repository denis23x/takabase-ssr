/** @format */

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import type { HttpRequest, HttpInterceptorFn, HttpHandlerFn, HttpEvent } from '@angular/common/http';

// prettier-ignore
export const httpErrorInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
	return next(request).pipe(
		catchError((error: HttpErrorResponse) => {
			if (error instanceof HttpErrorResponse) {
				const errorCustom: any = {
					...error,
					method: request.method,
				};

				return throwError(() => errorCustom);
			} else {
				return throwError(() => error);
			}
		})
	);
};
