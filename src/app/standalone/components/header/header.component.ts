/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { CommonModule } from '@angular/common';
import { AppAuthenticatedDirective } from '../../directives/app-authenticated.directive';
import { UserUrlPipe } from '../../pipes/user-url.pipe';
import { AuthorizationService } from '../../../core/services/authorization.service';
import { catchError, filter } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { CurrentUser } from '../../../core/models/current-user.model';
import { AppSkeletonDirective } from '../../directives/app-skeleton.directive';

@Component({
	standalone: true,
	selector: 'app-header, [appHeader]',
	imports: [
		CommonModule,
		RouterModule,
		SvgIconComponent,
		AvatarComponent,
		AppAuthenticatedDirective,
		UserUrlPipe,
		AppSkeletonDirective
	],
	templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	constructor(
		private authorizationService: AuthorizationService,
		private router: Router,
		private snackbarService: SnackbarService
	) {}

	ngOnInit(): void {
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});

		this.currentUserSkeletonToggle$ = this.authorizationService.currentUserIsPopulated
			.pipe(filter((currentUserIsPopulated: boolean) => currentUserIsPopulated))
			.subscribe({
				next: () => (this.currentUserSkeletonToggle = false),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.currentUser$, this.currentUserSkeletonToggle$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onLogout(): void {
		this.authorizationService
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
}
