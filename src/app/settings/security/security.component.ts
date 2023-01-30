/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import {
	AuthService,
	HelperService,
	LogoutDto,
	Session,
	SnackbarService,
	User
} from '../../core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'app-settings-security',
	templateUrl: './security.component.html'
})
export class SettingsSecurityComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private activatedRoute: ActivatedRoute,
		private authService: AuthService,
		private router: Router,
		private snackbarService: SnackbarService
	) {}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.parent?.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (user: User) => (this.authUser = user),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	onLogout(session: Session): void {
		this.authService.getFingerprint().subscribe({
			next: (fingerprint: string) => {
				if (session.fingerprint === fingerprint) {
					this.authService
						.onLogout()
						.pipe(
							catchError((httpErrorResponse: HttpErrorResponse) => {
								this.router
									.navigate(['/exception', httpErrorResponse.status])
									.then(() => console.debug('Route changed'));

								return throwError(() => httpErrorResponse);
							})
						)
						.subscribe({
							next: () => {
								this.router
									.navigateByUrl('/')
									.then(() => console.debug('Route changed'));
							}
						});
				} else {
					const logoutDto: LogoutDto = {
						id: session.id
					};

					this.authService
						.onLogout(logoutDto, false)
						.pipe(
							catchError((httpErrorResponse: HttpErrorResponse) => {
								this.router
									.navigate(['/exception', httpErrorResponse.status])
									.then(() => console.debug('Route changed'));

								return throwError(() => httpErrorResponse);
							})
						)
						.subscribe({
							next: () => {
								// prettier-ignore
								this.authUser.sessions = this.authUser.sessions.filter((session: Session) => {
                  return session.id !== logoutDto.id;
                });

								// prettier-ignore
								this.snackbarService.success(null, 'Session was successfully terminated');
							}
						});
				}
			}
		});
	}
}
