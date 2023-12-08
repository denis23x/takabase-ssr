/** @format */

import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { AppScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { AppSkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { ReportService } from '../core/services/report.service';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		AppScrollPresetDirective,
		SvgIconComponent,
		AppSkeletonDirective
	],
	selector: 'app-help',
	templateUrl: './help.component.html'
})
export class HelpComponent implements OnInit {
	helpNavigationList: any[] = [
		{
			path: 'markdown',
			name: 'Markdown'
		},
		{
			path: 'style-safe-list',
			name: 'Style safe list'
		},
		{
			path: 'compatibility',
			name: 'Compatibility'
		},
		{
			path: 'code-highlight',
			name: 'Code highlight'
		},
		{
			path: 'road-map',
			name: 'Road map'
		}
	];

	constructor(
		private metaService: MetaService,
		private reportService: ReportService
	) {}

	ngOnInit(): void {
		/** Apply Data */

		// Nothing to apply

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	setMetaTags(): void {
		const title: string = 'Help & Support';

		// prettier-ignore
		const description: string = 'Find answers to commonly asked questions and resources to assist you in navigating and making the most out of Draft';

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

	onToggleReportDialog(toggle: boolean): void {
		this.reportService.reportDialogToggle$.next(toggle);
	}
}
