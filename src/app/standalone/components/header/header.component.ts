/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { UserAvatarComponent } from '../user/avatar/avatar.component';
import { SkeletonDirective } from '../../directives/app-skeleton.directive';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { AuthenticatedComponent } from '../authenticated/authenticated.component';
import { SvgLogoComponent } from '../svg-logo/svg-logo.component';
import { CommonModule, Location } from '@angular/common';
import { HelperService } from '../../../core/services/helper.service';
import { CurrentUserMixin as CU } from '../../../core/mixins/current-user.mixin';

@Component({
	standalone: true,
	selector: 'app-header, [appHeader]',
	imports: [
		CommonModule,
		RouterModule,
		SvgIconComponent,
		UserAvatarComponent,
		SkeletonDirective,
		DropdownComponent,
		AuthenticatedComponent,
		SvgLogoComponent
	],
	templateUrl: './header.component.html',
	host: {
		ngSkipHydration: 'true'
	}
})
export class HeaderComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly router: Router = inject(Router);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly location: Location = inject(Location);
	private readonly helperService: HelperService = inject(HelperService);

	currentUserSignOutRequest$: Subscription | undefined;

	ngOnInit(): void {
		super.ngOnInit();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// ngOnDestroy

		[this.currentUserSignOutRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onLogout(): void {
		const path: string = this.location.path();
		const pathRestrictedList: string[] = ['/settings', '/create', '/update'];

		this.currentUserSignOutRequest$?.unsubscribe();
		this.currentUserSignOutRequest$ = this.authorizationService.getSignOut().subscribe({
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
