/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { MetaService } from '../../core/services/meta.service';
import { Subscription } from 'rxjs';

@Component({
	standalone: true,
	imports: [RouterModule],
	selector: 'app-auth-email-confirmation',
	templateUrl: './email-confirmation.component.html'
})
export class AuthEmailConfirmationComponent implements OnInit, OnDestroy {
	activatedRouteQueryParams$: Subscription | undefined;

	constructor(
		private activatedRoute: ActivatedRoute,
		private metaService: MetaService
	) {}

	ngOnInit(): void {
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams.subscribe(
			{
				next: (params: Params) => {
					console.log(params);
				},
				error: (error: any) => console.error(error)
			}
		);

		this.setMeta();
	}

	ngOnDestroy(): void {
		[this.activatedRouteQueryParams$].forEach($ => $?.unsubscribe());
	}

	setMeta(): void {
		const title: string = 'Email confirmation';
		const description: string = 'Thank you for verifying your email address';

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
