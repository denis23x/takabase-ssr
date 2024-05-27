/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { SkeletonDirective } from '../standalone/directives/app-skeleton.directive';

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
			path: 'about',
			name: 'About'
		},
		{
			path: 'markdown',
			name: 'Markdown'
		},
		{
			path: 'code-highlight',
			name: 'Code highlight'
		},
		{
			path: 'diagrams',
			name: 'Diagrams'
		},
		{
			path: 'safe-list',
			name: 'Safe list'
		},
		{
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
		const title: string = 'Help & Support';
		const description: string = 'Find answers to commonly asked questions';

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
