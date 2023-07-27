/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Data, Router, RouterModule } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { UAParser } from 'ua-parser-js';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { DayjsPipe } from '../../standalone/pipes/dayjs.pipe';
import { Session } from '../../core/models/session.model';
import { HelperService } from '../../core/services/helper.service';
import { AuthService } from '../../core/services/auth.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { SessionService } from '../../core/services/session.service';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SvgIconComponent, DayjsPipe],
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
		private sessionService: SessionService,
		private router: Router,
		private snackbarService: SnackbarService
	) {}

	ngOnInit(): void {
		// prettier-ignore
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(
				map((data: Data) => data.data),
				tap((sessionActiveList: Session[]) => {
          return this.sessionActiveList = sessionActiveList.map((session: Session) => {
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
						.navigate(['/error', httpErrorResponse.status])
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
		const sessionId: number = session.id;

		this.sessionService
			.delete(sessionId)
			.pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					this.router
						.navigate(['/error', httpErrorResponse.status])
						.then(() => console.debug('Route changed'));

					return throwError(() => httpErrorResponse);
				})
			)
			.subscribe({
				next: () => {
					// prettier-ignore
					this.sessionActiveList = this.sessionActiveList.filter((session: Session) => {
		        return session.id !== sessionId;
		      });

					// prettier-ignore
					this.snackbarService.success(null, 'Session was successfully terminated');
				},
				error: (error: any) => console.error(error)
			});
	}
}
