/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { HelperService, LogoutDto, Session, User } from '../../core';
import { ActivatedRoute, Data } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormBuilder } from '@angular/forms';

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
		private activatedRoute: ActivatedRoute
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
		const logoutDto: LogoutDto = {
			id: session.id
		};

		// TODO: update logout
		// this.authService
		// 	.onLogout(logoutDto)
		// 	.pipe(
		// 		switchMap(() => this.authService.getFingerprint()),
		// 		catchError((httpErrorResponse: HttpErrorResponse) => {
		// 			this.router
		// 				.navigate(['/exception', httpErrorResponse.status])
		// 				.then(() => console.debug('Route changed'));
		//
		// 			return throwError(() => httpErrorResponse);
		// 		})
		// 	)
		// 	.subscribe({
		// 		next: (fingerprint: string) => {
		// 			this.authUser.sessions = this.authUser.sessions.filter(
		// 				(session: Session) => {
		// 					return session.id !== logoutDto.id;
		// 				}
		// 			);
		//
		// 			this.snackbarService.success(null, 'Logout successful');
		//
		//       /** If current session add redirect */
		//
		//       if (session.fingerprint === fingerprint) {
		//         this.router
		//           .navigateByUrl('/')
		//           .then(() => console.debug('Route changed'));
		//       }
		// 		},
		// 		error: (error: any) => console.error(error)
		// 	});
	}
}
