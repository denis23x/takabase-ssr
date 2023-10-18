/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthorizationService } from '../core/services/authorization.service';
import { CurrentUser } from '../core/models/current-user.model';

@Injectable({
	providedIn: 'root'
})
export class SettingsResolverService {
	constructor(
		private authorizationService: AuthorizationService,
		private router: Router
	) {}

	resolve(): Observable<CurrentUser> {
		return this.authorizationService.getCurrentUser().pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
