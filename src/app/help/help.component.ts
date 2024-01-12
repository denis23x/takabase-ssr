/** @format */

import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MetaService } from '../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { SkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { ReportService } from '../core/services/report.service';

@Component({
	standalone: true,
	imports: [RouterModule, ScrollPresetDirective, SvgIconComponent, SkeletonDirective],
	selector: 'app-help',
	templateUrl: './help.component.html'
})
export class HelpComponent implements OnInit {
	private readonly metaService: MetaService = inject(MetaService);
	private readonly reportService: ReportService = inject(ReportService);

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
