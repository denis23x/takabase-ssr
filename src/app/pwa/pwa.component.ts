/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { MetaService } from '../core/services/meta.service';
import { filter, map, switchMap } from 'rxjs/operators';
import { User as FirebaseUser } from '@firebase/auth';
import { CurrentUser } from '../core/models/current-user.model';
import { AuthorizationService } from '../core/services/authorization.service';
import { PlatformService } from '../core/services/platform.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HelperService } from '../core/services/helper.service';
import { AppearanceService } from '../core/services/appearance.service';
import { SnackbarService } from '../core/services/snackbar.service';

@Component({
	standalone: true,
	templateUrl: './pwa.component.html'
})
export class PwaComponent implements OnInit, OnDestroy {
	private readonly metaService: MetaService = inject(MetaService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly router: Router = inject(Router);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;
	currentUserAuthStateChanged$: Subscription | undefined;

	ngOnInit(): void {
		// prettier-ignore
		if (this.platformService.isBrowser()) {
			this.currentUserAuthStateChanged$?.unsubscribe();
			this.currentUserAuthStateChanged$ = this.authorizationService
				.getAuthState()
				.pipe(filter((firebaseUser: FirebaseUser | null) => !!firebaseUser))
				.subscribe({
					next: () => {
						this.snackbarService.success("What's up", 'Loading, please wait...');

						/** Get user and redirect */

						this.currentUser$?.unsubscribe();
						this.currentUser$ = this.authorizationService
							.getPopulate()
							.pipe(
								filter((currentUser: CurrentUser | undefined) => !!currentUser),
								switchMap((currentUser: CurrentUser) => this.appearanceService.getAppearance(currentUser.firebase.uid).pipe(map(() => currentUser)))
							)
							.subscribe({
								next: (currentUser: CurrentUser) => {
									this.router.navigate(['/', currentUser.name]).catch((error: any) => {
										this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error);
									});
								},
								error: (error: any) => console.error(error)
							});
					},
					error: (error: any) => console.error(error)
				});
		}

		/** Apply Data */

		// Nothing to apply

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.currentUser$, this.currentUserAuthStateChanged$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setMetaTags(): void {
		const title: string = 'Loading';
		const description: string = 'Loading something exciting just for you. Stay tuned!';

		const metaOpenGraph: MetaOpenGraph = {
			['og:title']: title,
			['og:description']: description,
			['og:type']: 'website'
		};

		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description
		};

		this.metaService.setMeta(metaOpenGraph, metaTwitter);
	}
}
