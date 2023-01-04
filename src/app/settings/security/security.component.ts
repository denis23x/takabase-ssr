/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import {
	AuthService,
	HelperService,
	LogoutDto,
	Session,
	SnackbarService,
	User
} from '../../core';
import { ActivatedRoute, Data, Router } from '@angular/router';
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
		const logoutDto: LogoutDto = {
			id: session.id
		};

		this.authService.onLogout(logoutDto).subscribe({
			next: () => {
				// prettier-ignore
				this.authUser.sessions = this.authUser.sessions.filter((session: Session) => {
          return session.id !== logoutDto.id;
        });

				this.snackbarService.success(null, 'Logout successful');
			},
			error: (error: any) => console.error(error)
		});
	}
}
