/** @format */

import { Injectable } from '@angular/core';
import { CanMatch, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../services/snackbar.service';

@Injectable({
	providedIn: 'root'
})
export class CanMatchPrivateGuard implements CanMatch {
	constructor(
		private authService: AuthService,
		private router: Router,
		private snackbarService: SnackbarService
	) {}

	canMatch(): Observable<boolean> {
		return this.authService.getUser().pipe(
			switchMap((user: User | undefined) => {
				if (user) {
					return of(true);
				}

				this.router.navigate(['/error', 401]).then(() => {
					this.snackbarService.warning('Unauthorized', 'Login to continue');
				});

				return of(false);
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
