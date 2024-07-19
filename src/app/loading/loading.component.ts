/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { MetaService } from '../core/services/meta.service';
import type { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';

@Component({
	standalone: true,
	templateUrl: './loading.component.html'
})
export class LoadingComponent implements OnInit {
	private readonly metaService: MetaService = inject(MetaService);

	ngOnInit(): void {
		/** Apply Data */

		// Nothing to apply

		/** Apply SEO meta tags */

		this.setMetaTags();
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
