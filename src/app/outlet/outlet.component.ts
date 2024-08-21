/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AppearanceService } from '../core/services/appearance.service';
import { AuthorizationService } from '../core/services/authorization.service';
import { filter, first, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { SnackbarComponent } from '../standalone/components/snackbar/snackbar.component';
import { HeaderComponent } from '../standalone/components/header/header.component';
import { ScrollToTopComponent } from '../standalone/components/scroll-to-top/scroll-to-top.component';
import { PlatformService } from '../core/services/platform.service';
import { CookiesComponent } from '../standalone/components/cookies/cookies.component';
import { version } from '../../versions/version';
import { environment } from '../../environments/environment';
import { Location } from '@angular/common';
import type { CurrentUser } from '../core/models/current-user.model';

@Component({
	standalone: true,
	imports: [RouterModule, SnackbarComponent, HeaderComponent, ScrollToTopComponent, CookiesComponent],
	selector: 'app-outlet',
	templateUrl: './outlet.component.html'
})
export class OutletComponent implements OnInit, OnDestroy {
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly location: Location = inject(Location);

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			this.currentUser$?.unsubscribe();
			this.currentUser$ = this.authorizationService
				.getPopulate()
				.pipe(
					first(),
					filter((currentUser: CurrentUser | undefined) => !!currentUser),
					switchMap((currentUser: CurrentUser) => this.appearanceService.getAppearance(currentUser.firebase.uid))
				)
				.subscribe({
					next: () => console.debug('User populated'),
					error: (error: any) => console.error(error)
				});

			/** Show version */

			if (environment.production) {
				console.debug(Object.values(version).join(' - '));

				if (this.location.path().includes('debug')) {
					import('eruda').then((eruda: any) => eruda.default.init());
				}
			}
		}
	}

	ngOnDestroy(): void {
		[this.currentUser$].forEach(($: Subscription) => $?.unsubscribe());
	}
}
