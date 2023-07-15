/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class HelpDetailsResolverService {
	constructor(
		private httpClient: HttpClient,
		private router: Router
	) {}

	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<any> {
		// prettier-ignore
		const markdown: string = String(activatedRouteSnapshot.paramMap.get('markdown'));
		const markdownFile: string = '/assets/markdown/help/' + markdown + '.md';

		return this.httpClient
			.get(markdownFile, {
				responseType: 'text'
			})
			.pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					this.router
						.navigate(['/error', httpErrorResponse.status])
						.then(() => console.debug('Route changed'));

					return throwError(() => httpErrorResponse);
				})
			);
	}
}
