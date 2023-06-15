/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class TermsDetailsResolverService {
	constructor(private httpClient: HttpClient, private router: Router) {}

	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<any> {
		// prettier-ignore
		const markdown: string = String(activatedRouteSnapshot.paramMap.get('markdown'));
		const markdownFile: string = '/assets/markdown/terms/' + markdown + '.md';

		const requestOptions: any = {
			responseType: 'text'
		};

		return this.httpClient.get(markdownFile, requestOptions).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
