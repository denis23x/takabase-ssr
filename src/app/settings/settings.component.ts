/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { PlatformDirective } from '../standalone/directives/app-platform.directive';
import { MetaService } from '../core/services/meta.service';
import { CurrentUserMixin as CU } from '../core/mixins/current-user.mixin';
import type { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';

@Component({
	standalone: true,
	imports: [RouterModule, ScrollPresetDirective, PlatformDirective],
	selector: 'app-settings',
	templateUrl: './settings.component.html'
})
export class SettingsComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly metaService: MetaService = inject(MetaService);

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	setMetaTags(): void {
		const title: string = 'Customize Your Takabase Experience';

		// prettier-ignore
		const description: string = 'Tailor your Takabase experience by adjusting your user settings. Manage your account, preferences and interactions seamlessly to make the most of your personalized experience';

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
