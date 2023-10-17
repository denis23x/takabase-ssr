/** @format */

import { Injectable } from '@angular/core';
import { CanMatch, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { catchError, map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../services/snackbar.service';
import { PlatformService } from '../services/platform.service';

@Injectable({
	providedIn: 'root'
})
export class CanMatchPrivateGuard implements CanMatch {
	constructor(
		private authService: AuthService,
		private router: Router,
		private snackbarService: SnackbarService,
		private platformService: PlatformService
	) {}

	canMatch(): Observable<boolean> {
		return this.authService.getCurrentUser().pipe(
			map((user: User | undefined) => {
				if (this.platformService.isBrowser() && !user) {
					this.router.navigate(['/error', 401]).then(() => {
						this.snackbarService.warning('Unauthorized', 'Login to continue');
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
