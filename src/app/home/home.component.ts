/** @format */

import { Component, inject, makeStateKey, OnDestroy, OnInit, StateKey, TransferState } from '@angular/core';
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
import { PWAComponent } from '../standalone/components/pwa/pwa.component';
import { MathPipe } from '../standalone/pipes/math.pipe';
import { PlatformService } from '../core/services/platform.service';
import homeHighlights from '../../assets/json/home-highlights.json';
import dayjs from 'dayjs/esm';
import type { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import type { ManipulateType } from 'dayjs/esm';
import type { Insight } from '../core/models/insight.model';
import type { InsightGetAllDto } from '../core/dto/insight/insight-get-all.dto';

const insightResponse: StateKey<any> = makeStateKey<any>('insightResponse');

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SvgIconComponent, SvgLogoComponent, SkeletonDirective, PWAComponent, MathPipe],
	selector: 'app-home',
	templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
	private readonly metaService: MetaService = inject(MetaService);
	private readonly titleService: TitleService = inject(TitleService);
	private readonly apiService: ApiService = inject(ApiService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly transferState: TransferState = inject(TransferState);
	private readonly platformService: PlatformService = inject(PlatformService);

	appInsightValue: number = 1;
	appInsightUnit: ManipulateType = 'week';

	appInsightList: Insight[] = [];
	appInsightListSkeletonToggle: boolean = true;
	appInsightList$: Subscription | undefined;
	appInsightListTime: string | undefined;
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

	appHighlightList: Record<string, string | number>[] = homeHighlights;
	appHighlightListActive: number = 1;

	ngOnInit(): void {
		const from: string = dayjs().subtract(this.appInsightValue, this.appInsightUnit).format('MMM D');
		const to: string = dayjs().format('MMM D');

		this.appInsightListTime = from + ' - ' + to;

		/** Apply Data */

		if (this.transferState.hasKey(insightResponse)) {
			this.setInsightResponse(this.transferState.get(insightResponse, null));

			if (this.platformService.isBrowser()) {
				this.transferState.remove(insightResponse);
			}
		} else {
			this.setSkeleton();
			this.setResolver();
		}

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
		const insightGetAllDto: InsightGetAllDto = {
			value: this.appInsightValue,
			unit: this.appInsightUnit
		};

		this.appInsightList$?.unsubscribe();
		this.appInsightList$ = this.apiService.get('/v1/insights', insightGetAllDto).subscribe({
			next: (insightList: any) => {
				this.setInsightResponse(insightList);

				if (this.platformService.isServer()) {
					this.transferState.set(insightResponse, insightList);
				}
			},
			error: (error: any) => console.error(error)
		});
	}

	setTitle(): void {
		this.titleService.setTitle('Discover the Latest Posts and Insights on Takabase');
	}

	setMetaTags(): void {
		const title: string = 'Discover the Latest Posts and Insights on Takabase';

		// prettier-ignore
		const description: string = 'Explore the latest posts, categories and insights on Takabase. Stay updated with what is trending and connected with vibrant community. Discover fresh content and engage with like-minded individuals every day';

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

	setInsightResponse(insightList: any): void {
		this.appInsightListSkeletonToggle = false;
		this.appInsightList = Object.entries(insightList).map(([key, value]: [string, any], i: number) => ({
			...value,
			id: i + 1,
			key: key,
			value: key.toUpperCase()
		}));
	}
}
