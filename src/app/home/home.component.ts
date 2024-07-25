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
import { SkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { SkeletonService } from '../core/services/skeleton.service';
import homeFeatures from '../../assets/json/home-features.json';
import dayjs from 'dayjs/esm';
import relativeTime from 'dayjs/esm/plugin/relativeTime';
import type { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import type { ManipulateType } from 'dayjs/esm';
import type { PWAComponent } from '../standalone/components/pwa/pwa.component';
import type { Insight } from '../core/models/insight.model';
import type { InsightGetAllDto } from '../core/dto/insight/insight-get-all.dto';

dayjs.extend(relativeTime);

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SvgIconComponent, SvgLogoComponent, SkeletonDirective],
	selector: 'app-home',
	templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
	private readonly metaService: MetaService = inject(MetaService);
	private readonly titleService: TitleService = inject(TitleService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
	private readonly apiService: ApiService = inject(ApiService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);

	appFeatureList: Record<string, string | number>[] = homeFeatures;
	appFeatureListIndex: number = 1;

	appInsightValue: number = 1;
	appInsightUnit: ManipulateType = 'day';

	appInsightList: Insight[] = [];
	appInsightListSkeletonToggle: boolean = true;
	appInsightList$: Subscription | undefined;
	appInsightListTime: string | undefined;
	appInsightListTimeFormat: string = 'MMM D';
	appInsightListChangeState: any = {
		stasis: {
			classList: 'text-base-content/50',
			character: '='
		},
		positive: {
			classList: 'text-success',
			character: '↗︎'
		},
		negative: {
			classList: 'text-error',
			character: '↘︎'
		}
	};

	// Lazy loading

	appPWAComponent: ComponentRef<PWAComponent>;

	ngOnInit(): void {
		/** Apply Data */

		this.setSkeleton();
		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
		this.setTitle();
	}

	ngOnDestroy(): void {
		[this.appInsightList$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.appInsightList = this.skeletonService.getInsightList();
		this.appInsightListSkeletonToggle = true;
	}

	setResolver(): void {
		// prettier-ignore
		this.appInsightListTime = dayjs().format(this.appInsightListTimeFormat) + ' - ' + dayjs().subtract(this.appInsightValue, this.appInsightUnit).format(this.appInsightListTimeFormat);

		const insightGetAllDto: InsightGetAllDto = {
			value: this.appInsightValue,
			unit: this.appInsightUnit
		};

		this.appInsightList$?.unsubscribe();
		this.appInsightList$ = this.apiService.get('/v1/utilities/insights', insightGetAllDto).subscribe({
			next: (insightList: any) => {
				this.appInsightListSkeletonToggle = false;
				this.appInsightList = this.appInsightList.map((insight: Insight) => ({
					...insight,
					...insightList[insight.key]
				}));
			},
			error: (error: any) => console.error(error)
		});
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
