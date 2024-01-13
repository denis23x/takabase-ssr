/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { AuthenticatedDirective } from '../../directives/app-authenticated.directive';
import { UserUrlPipe } from '../../pipes/user-url.pipe';
import { AuthorizationService } from '../../../core/services/authorization.service';
import { catchError, filter } from 'rxjs/operators';
import { CurrentUser } from '../../../core/models/current-user.model';
import { SkeletonDirective } from '../../directives/app-skeleton.directive';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
	standalone: true,
	selector: 'app-header, [appHeader]',
	imports: [
		RouterModule,
		SvgIconComponent,
		AvatarComponent,
		AuthenticatedDirective,
		UserUrlPipe,
		SkeletonDirective,
		DropdownComponent
	],
	templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly router: Router = inject(Router);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;
	currentUserLogoutRequest$: Subscription | undefined;

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});

		this.currentUserSkeletonToggle$?.unsubscribe();
		this.currentUserSkeletonToggle$ = this.authorizationService.currentUserIsPopulated
			.pipe(filter((currentUserIsPopulated: boolean) => currentUserIsPopulated))
			.subscribe({
				next: () => (this.currentUserSkeletonToggle = false),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[
      this.currentUser$,
      this.currentUserSkeletonToggle$,
      this.currentUserLogoutRequest$
    ].forEach(($: Subscription) => $?.unsubscribe());
	}

	onLogout(): void {
		this.currentUserLogoutRequest$?.unsubscribe();
		this.currentUserLogoutRequest$ = this.authorizationService
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
