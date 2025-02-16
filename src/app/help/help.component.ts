/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MetaService } from '../core/services/meta.service';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { SkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import type { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';

@Component({
	standalone: true,
	imports: [RouterModule, ScrollPresetDirective, SvgIconComponent, SkeletonDirective],
	selector: 'app-help',
	templateUrl: './help.component.html'
})
export class HelpComponent implements OnInit {
	private readonly metaService: MetaService = inject(MetaService);

	helpNavigationList: any[] = [
		{
			id: 1,
			path: 'about',
			name: 'About'
		},
		{
			id: 2,
			path: 'markdown',
			name: 'Markdown'
		},
		{
			id: 3,
			path: 'code-highlight',
			name: 'Code highlight'
		},
		{
			id: 4,
			path: 'diagrams',
			name: 'Diagrams'
		},
		{
			id: 5,
			path: 'safe-list',
			name: 'Safe list'
		},
		{
			id: 6,
			path: 'compatibility',
			name: 'Compatibility'
		}
	];

	ngOnInit(): void {
		/** Apply Data */

		// Nothing to apply

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	setMetaTags(): void {
		const title: string = 'Need Support? Answers and Help Found Here';

		// prettier-ignore
		const description: string = 'Get the answers you need with this Help & Support section. Whether you have questions or need guidance, Takabase is here to assist you every step of the way. Explore these resources and find the support you need right now';

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
