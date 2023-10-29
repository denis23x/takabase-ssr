/** @format */

import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { AppScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, AppScrollPresetDirective, SvgIconComponent],
	selector: 'app-terms',
	templateUrl: './terms.component.html'
})
export class TermsComponent implements OnInit {
	termsNavigationList: any[] = [
		{
			path: 'terms-of-use',
			name: 'Terms of use'
		},
		{
			path: 'cookie-policy',
			name: 'Cookie policy'
		}
	];

	constructor(private metaService: MetaService) {}

	ngOnInit(): void {
		/** Apply Data */

		// Nothing to apply

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	setMetaTags(): void {
		const title: string = 'Terms of use';

		// prettier-ignore
		const description: string = 'Read our terms of use to understand the rules and guidelines for using Draft.';

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
