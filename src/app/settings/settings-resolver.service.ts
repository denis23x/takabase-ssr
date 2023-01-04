/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, UserService } from '../core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class SettingsResolverService {
	constructor(private userService: UserService, private router: Router) {}

	resolve(): Observable<User> {
		return this.userService
			.getMe({
				scope: ['sessions', 'settings']
			})
			.pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					this.router
						.navigate(['/exception', httpErrorResponse.status])
						.then(() => console.debug('Route changed'));

					return throwError(() => httpErrorResponse);
				})
			);
	}
}
