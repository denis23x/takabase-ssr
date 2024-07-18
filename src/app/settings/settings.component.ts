/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { MetaService } from '../core/services/meta.service';
import { PlatformDirective } from '../standalone/directives/app-platform.directive';

@Component({
	standalone: true,
	imports: [RouterModule, ScrollPresetDirective, PlatformDirective],
	selector: 'app-settings',
	templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
	private readonly metaService: MetaService = inject(MetaService);

	ngOnInit(): void {
		/** Apply Data */

		// Nothing to apply

		/** Apply SEO meta tags */

		this.setMetaTags();
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
