/** @format */

import { Injectable } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user.model';

@Injectable({
	providedIn: 'root'
})
export class SettingsResolverService {
	constructor(
		private authService: AuthService,
		private router: Router
	) {}

	resolve(): Observable<User> {
		return this.authService.getUser().pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
