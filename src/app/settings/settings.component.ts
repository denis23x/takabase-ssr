/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Data, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppScrollIntoViewDirective } from '../standalone/directives/app-scroll-into-view.directive';
import { User } from '../core/models/user.model';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { MetaService } from '../core/services/meta.service';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, AppScrollIntoViewDirective],
	selector: 'app-settings',
	templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	user: User | undefined;

	constructor(
		private activatedRoute: ActivatedRoute,
		private metaService: MetaService
	) {}

	ngOnInit() {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (user: User) => (this.user = user),
				error: (error: any) => console.error(error)
			});

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setMetaTags(): void {
		const title: string = 'User settings';

		// prettier-ignore
		const description: string = 'Adjust preferences, update account information, and tailor your interactions to match your preferences';

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
