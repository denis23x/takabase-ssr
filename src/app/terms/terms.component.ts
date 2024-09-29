/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MetaService } from '../core/services/meta.service';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import type { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';

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
			id: 1,
			path: 'cookie-policy',
			name: 'Cookie Policy'
		},
		{
			id: 2,
			path: 'privacy-policy',
			name: 'Privacy Policy'
		},
		// {
		//  id: 3,
		// 	path: 'refund-policy',
		// 	name: 'Refund Policy'
		// },
		{
			id: 4,
			path: 'terms-of-service',
			name: 'Terms of Service'
		},
		{
			id: 5,
			path: 'user-data-deletion',
			name: 'User data deletion'
		},
		{
			id: 6,
			path: 'content-moderation',
			name: 'Content Moderation'
		}
	];

	ngOnInit(): void {
		/** Apply Data */

		// Nothing to apply

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	setMetaTags(): void {
		const title: string = 'Takabase Terms of Service';

		// prettier-ignore
		const description: string = 'Familiarize yourself with Takabase rules by reading our comprehensive Terms of Service. Stay informed about your rights and responsibilities to ensure a smooth and compliant experience';

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
