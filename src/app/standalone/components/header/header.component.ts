/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { AuthorizationService } from '../../../core/services/authorization.service';
import { filter } from 'rxjs/operators';
import { CurrentUser } from '../../../core/models/current-user.model';
import { SkeletonDirective } from '../../directives/app-skeleton.directive';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { AuthenticatedComponent } from '../authenticated/authenticated.component';
import { SvgLogoComponent } from '../svg-logo/svg-logo.component';
import { Location } from '@angular/common';
import { HelperService } from '../../../core/services/helper.service';

@Component({
	standalone: true,
	selector: 'app-header, [appHeader]',
	imports: [
		RouterModule,
		SvgIconComponent,
		AvatarComponent,
		SkeletonDirective,
		DropdownComponent,
		AuthenticatedComponent,
		SvgLogoComponent
	],
	templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly router: Router = inject(Router);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly location: Location = inject(Location);
	private readonly helperService: HelperService = inject(HelperService);

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;
	currentUserSignOutRequest$: Subscription | undefined;

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser | undefined) => (this.currentUser = currentUser),
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
		[this.currentUser$, this.currentUserSkeletonToggle$, this.currentUserSignOutRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onLogout(): void {
		const path: string = this.location.path();
		const pathRestrictedList: string[] = ['/settings', '/create', '/update'];

		this.currentUserSignOutRequest$?.unsubscribe();
		this.currentUserSignOutRequest$ = this.authorizationService.onSignOut().subscribe({
			next: () => {
				if (pathRestrictedList.some((pathRestricted: string) => path.startsWith(pathRestricted))) {
					this.router.navigateByUrl('/').catch((error: any) => {
						this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error);
					});

					this.snackbarService.success(null, 'Bye bye');
				} else {
					this.snackbarService.success(null, 'See ya');
				}
			},
			error: (error: any) => console.error(error)
		});
	}
}
