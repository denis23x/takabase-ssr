/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { MetaService } from '../../core/services/meta.service';

@Component({
	standalone: true,
	imports: [RouterModule],
	templateUrl: 'confirmation.component.html'
})
export class AuthConfirmationComponent implements OnInit {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly router: Router = inject(Router);
	private readonly metaService: MetaService = inject(MetaService);

	ngOnInit(): void {
		/** Apply Data */

		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	setResolver(): void {
		const mode: string = String(this.activatedRoute.snapshot.queryParamMap.get('mode') || '');

		const redirectToMode = (commands: any[]) => {
			this.router
				.navigate(commands, {
					queryParamsHandling: 'preserve',
					relativeTo: this.activatedRoute
				})
				.then(() => console.debug('Route changed'));
		};

		switch (mode) {
			case 'resetPassword':
				redirectToMode(['password']);

				break;
			case 'recoverEmail':
				redirectToMode(['recovery']);

				break;
			case 'verifyEmail':
			case 'verifyAndChangeEmail':
				redirectToMode(['email']);

				break;
			default:
				this.router.navigate(['error', 404]).then(() => console.debug('Route changed'));

				break;
		}
	}

	setMetaTags(): void {
		const title: string = 'Confirmation page';
		const description: string = 'Please wait a moment while we redirect you';

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
