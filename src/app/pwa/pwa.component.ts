/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { MetaService } from '../core/services/meta.service';
import { switchMap } from 'rxjs/operators';
import { CurrentUser } from '../core/models/current-user.model';
import { AuthorizationService } from '../core/services/authorization.service';
import { PlatformService } from '../core/services/platform.service';
import { from, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AppearanceService } from '../core/services/appearance.service';

@Component({
	standalone: true,
	templateUrl: './pwa.component.html'
})
export class PwaComponent implements OnInit, OnDestroy {
	private readonly metaService: MetaService = inject(MetaService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly router: Router = inject(Router);
	private readonly appearanceService: AppearanceService = inject(AppearanceService);

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			this.currentUser$?.unsubscribe();
			this.currentUser$ = this.authorizationService
				.getPopulate()
				.pipe(
					switchMap((currentUser: CurrentUser | undefined) => {
						if (currentUser) {
							return this.appearanceService
								.getAppearance(currentUser.firebase.uid)
								.pipe(switchMap(() => from(this.router.navigate(['/', currentUser.name]))));
						} else {
							return from(this.router.navigate(['/login']));
						}
					})
				)
				.subscribe({
					next: () => console.debug('User populated'),
					error: (error: any) => console.error(error)
				});
		}

		/** Apply Data */

		// Nothing to apply

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.currentUser$].forEach(($: Subscription) => $?.unsubscribe());
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
