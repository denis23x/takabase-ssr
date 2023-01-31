/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
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
import { UAParser } from 'ua-parser-js';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'app-settings-security',
	templateUrl: './security.component.html'
})
export class SettingsSecurityComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	uaParser: UAParser = new UAParser();

	sessionGeolocation: string = 'https://get.geojs.io/v1/ip/geo/';
	sessionActive: Session | undefined;
	sessionActiveList: Session[] = [];

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private activatedRoute: ActivatedRoute,
		private authService: AuthService,
		private router: Router,
		private snackbarService: SnackbarService
	) {}

	ngOnInit(): void {
		// prettier-ignore
		this.activatedRouteData$ = this.activatedRoute.parent?.data
			.pipe(
				map((data: Data) => data.data),
				tap((user: User) => {
          return this.sessionActiveList = user.sessions.map((session: Session) => {
            return {
              ...session,
              uaParsed: this.uaParser.setUA(session.ua).getResult()
            };
          })
        }),
				switchMap(() => this.authService.getFingerprint())
			)
			.subscribe({
				next: (fingerprint: string) => {
					this.sessionActive = this.sessionActiveList.find((session: Session) => {
						return session.fingerprint === fingerprint;
					});

					this.sessionActiveList = this.sessionActiveList.filter((session: Session) => {
						return session.fingerprint !== fingerprint;
					});
        },
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	onLogout(): void {
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
					this.router.navigateByUrl('/').then(() => {
						this.snackbarService.success(null, 'Bye bye');
					});
				},
				error: (error: any) => console.error(error)
			});
	}

	onTerminate(session: Session): void {
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
					this.sessionActiveList = this.sessionActiveList.filter((session: Session) => {
            return session.id !== logoutDto.id;
          });

					// prettier-ignore
					this.snackbarService.success(null, 'Session was successfully terminated');
				}
			});
	}
}
