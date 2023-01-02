/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { AuthService, User } from '../../../core';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'app-header, [appHeader]',
	templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
	authUser: User | undefined;
	authUser$: Subscription | undefined;

	constructor(private authService: AuthService, private router: Router) {}

	ngOnInit(): void {
		this.authUser$ = this.authService.user.subscribe({
			next: (user: User) => (this.authUser = user),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.authUser$].forEach($ => $?.unsubscribe());
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
					this.router
						.navigateByUrl('/')
						.then(() => console.debug('Route changed'));
				},
				error: (error: any) => console.error(error)
			});
	}
}
