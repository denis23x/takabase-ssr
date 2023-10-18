/** @format */

import { Injectable } from '@angular/core';
import { CanMatch, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SnackbarService } from '../services/snackbar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PlatformService } from '../services/platform.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Injectable({
	providedIn: 'root'
})
export class CanMatchPublicGuard implements CanMatch {
	constructor(
		private router: Router,
		private snackbarService: SnackbarService,
		private platformService: PlatformService,
		private authService: AuthService
	) {}

	canMatch(): Observable<boolean> {
		return this.authService.onPopulate().pipe(
			map((user: User | null) => {
				if (this.platformService.isBrowser() && !!user) {
					this.router.navigate(['/error', 403]).then(() => {
						this.snackbarService.warning('Forbidden', 'Access denied');
					});

					return false;
				}

				return true;
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', 401])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
