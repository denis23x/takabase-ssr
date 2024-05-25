/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';

@Component({
	standalone: true,
	imports: [RouterModule, ScrollPresetDirective, SvgIconComponent],
	selector: 'app-terms',
	templateUrl: './terms.component.html'
})
export class TermsComponent implements OnInit {
	private readonly metaService: MetaService = inject(MetaService);

	termsNavigationList: any[] = [
		{
			path: 'cookie-policy',
			name: 'Cookie Policy'
		},
		{
			path: 'privacy-policy',
			name: 'Privacy Policy'
		},
		// {
		// 	path: 'refund-policy',
		// 	name: 'Refund Policy'
		// },
		{
			path: 'terms-of-service',
			name: 'Terms of Service'
		}
	];

	ngOnInit(): void {
		/** Apply Data */

		// Nothing to apply

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	setMetaTags(): void {
		const title: string = 'Terms of use';

		// prettier-ignore
		const description: string = 'Read our terms of use to understand the rules and guidelines for using Takabase.';

		const metaOpenGraph: Partial<MetaOpenGraph> = {
			['og:title']: title,
			['og:description']: description,
			['og:type']: 'website'
		};

		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description
		};

		this.metaService.setMeta(metaOpenGraph as MetaOpenGraph, metaTwitter);
	}
}
