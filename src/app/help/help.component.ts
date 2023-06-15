/** @format */

import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { AppScrollIntoViewDirective } from '../shared/directives/app-scroll-into-view.directive';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, AppScrollIntoViewDirective],
	selector: 'app-help',
	templateUrl: './help.component.html'
})
export class HelpComponent implements OnInit {
	helpNavigationList: any[] = [
		{
			path: 'features',
			name: 'Features'
		},
		{
			path: 'code-highlight',
			name: 'Code highlight'
		},
		{
			path: 'style-safe-list',
			name: 'Style safe list'
		},
		{
			path: 'deep-dive',
			name: 'Deep dive'
		},
		{
			path: 'compatibility',
			name: 'Compatibility'
		},
		{
			path: 'road-map',
			name: 'Road map'
		}
	];

	constructor(private metaService: MetaService) {}

	ngOnInit(): void {
		this.setMeta();
	}

	setMeta(): void {
		const title: string = 'Help & Support';

		// prettier-ignore
		const description: string = 'Find answers to commonly asked questions and resources to assist you in navigating and making the most out of Draft';

		const metaOpenGraph: Partial<MetaOpenGraph> = {
			['og:title']: title,
			['og:description']: description,
			['og:type']: 'website'
		};

		// prettier-ignore
		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description,
		};

		this.metaService.setMeta(metaOpenGraph as MetaOpenGraph, metaTwitter);
	}
}
