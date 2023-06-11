/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class RightsDetailResolverService {
	constructor(private httpClient: HttpClient, private router: Router) {}

	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<any> {
		const path: string = activatedRouteSnapshot.url[0].path;

		const markdownMap: any = {
			'terms-of-use': '/assets/markdown/terms/terms-of-use.md',
			'cookie-policy': '/assets/markdown/terms/cookie-policy.md'
		};

		const requestOptions: any = {
			responseType: 'text'
		};

		return this.httpClient.get(markdownMap[path], requestOptions).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
