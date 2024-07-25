/** @format */

import { Component, ComponentRef, inject, OnDestroy, OnInit, Type, ViewContainerRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { MetaService } from '../core/services/meta.service';
import { SvgLogoComponent } from '../standalone/components/svg-logo/svg-logo.component';
import { TitleService } from '../core/services/title.service';
import { ApiService } from '../core/services/api.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import homeFeatures from '../../assets/json/home-features.json';
import dayjs from 'dayjs/esm';
import relativeTime from 'dayjs/esm/plugin/relativeTime';
import type { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import type { PWAComponent } from '../standalone/components/pwa/pwa.component';

dayjs.extend(relativeTime);

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SvgIconComponent, SvgLogoComponent],
	selector: 'app-home',
	templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
	private readonly metaService: MetaService = inject(MetaService);
	private readonly titleService: TitleService = inject(TitleService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
	private readonly apiService: ApiService = inject(ApiService);

	appFeatureList: Record<string, string | number>[] = homeFeatures;
	appFeatureListIndex: number = 1;

	appInsightList: any[] = [];
	appInsightList$: Subscription | undefined;
	appInsightListTime: string | undefined;

	// Lazy loading

	appPWAComponent: ComponentRef<PWAComponent>;

	ngOnInit(): void {
		const timeLastMonth: string = dayjs().format('MMM D');
		const timeToday: string = dayjs().subtract(1, 'month').format('MMM D');

		this.appInsightListTime = timeLastMonth + ' - ' + timeToday;

		this.appInsightList$?.unsubscribe();
		this.appInsightList$ = this.apiService.get('/v1/tests/dummy').subscribe({
			next: (insights: any) => {
				Object.keys(insights).forEach((key: string, i: number) => {
					this.appInsightList.push({
						id: i + 1,
						title: key,
						...insights[key]
					});
				});

				console.log(this.appInsightList);
			},
			error: (error: any) => console.error(error)
		});

		/** Apply SEO meta tags */

		this.setMetaTags();
		this.setTitle();
	}

	ngOnDestroy(): void {
		[this.appInsightList$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setTitle(): void {
		this.titleService.setTitle('Home');
	}

	setMetaTags(): void {
		const title: string = 'Takabase';
		const description: string = 'Stay up to date with the latest posts and insights from Takabase';

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

	/** LAZY */

	async onTogglePWADialog(): Promise<void> {
		if (!this.appPWAComponent) {
			const pwaComponent: Type<PWAComponent> = await import('../standalone/components/pwa/pwa.component').then(m => {
				return m.PWAComponent;
			});

			this.appPWAComponent = this.viewContainerRef.createComponent(pwaComponent);
		}

		this.appPWAComponent.changeDetectorRef.detectChanges();
		this.appPWAComponent.instance.onTogglePWADialog(true);
	}
}
