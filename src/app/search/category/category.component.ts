/** @format */

import { Component, inject, makeStateKey, OnDestroy, OnInit, StateKey, TransferState } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { CardCategoryComponent } from '../../standalone/components/card/category/category.component';
import { BehaviorSubject, distinctUntilKeyChanged, from, Subscription } from 'rxjs';
import { AdComponent } from '../../standalone/components/ad/ad.component';
import { ListLoadMoreComponent } from '../../standalone/components/list/load-more/load-more.component';
import { SkeletonService } from '../../core/services/skeleton.service';
import { MetaService } from '../../core/services/meta.service';
import { AlgoliaService } from '../../core/services/algolia.service';
import { PlatformService } from '../../core/services/platform.service';
import { ListMockComponent } from '../../standalone/components/list/mock/mock.component';
import { CookiesService } from '../../core/services/cookies.service';
import type { Category } from '../../core/models/category.model';
import type { CategoryGetAllDto } from '../../core/dto/category/category-get-all.dto';
import type { SearchIndex } from 'algoliasearch/lite';
import type { SearchOptions, SearchResponse } from '@algolia/client-search';
import type { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';

const searchResponseKey: StateKey<SearchResponse<Category>> = makeStateKey<SearchResponse<Category>>('searchResponse');

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		SvgIconComponent,
		SkeletonDirective,
		CardCategoryComponent,
		AdComponent,
		ListLoadMoreComponent,
		ListMockComponent
	],
	providers: [AlgoliaService],
	selector: 'app-search-category',
	templateUrl: './category.component.html'
})
export class SearchCategoryComponent implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly algoliaService: AlgoliaService = inject(AlgoliaService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly transferState: TransferState = inject(TransferState);
	private readonly cookiesService: CookiesService = inject(CookiesService);

	activatedRouteQueryParams$: Subscription | undefined;

	categoryList: Category[] = [];
	categoryListRequest$: Subscription | undefined;
	categoryListSkeletonToggle: boolean = true;
	categoryGetAllDto: CategoryGetAllDto = {
		page: 0,
		size: 20
	};

	categoryListSearchResponse: Omit<SearchResponse<Category>, 'hits'> | undefined;
	categoryListIsLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	ngOnInit(): void {
		this.activatedRouteQueryParams$?.unsubscribe();
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams.pipe(distinctUntilKeyChanged('query')).subscribe({
			next: () => {
				if (this.transferState.hasKey(searchResponseKey)) {
					this.setCategoryListSearchResponse(this.transferState.get(searchResponseKey, null));

					if (this.platformService.isBrowser()) {
						this.transferState.remove(searchResponseKey);
					}
				} else {
					/** Apply Data */

					this.setSkeleton();
					this.setResolver();
				}
			},
			error: (error: any) => console.error(error)
		});

		/** Set cookie for soft redirect */

		this.cookiesService.setItem('page-redirect-search', 'categories');

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.activatedRouteQueryParams$, this.categoryListRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.categoryList = this.skeletonService.getCategoryList(['user']);
		this.categoryListSkeletonToggle = true;
	}

	setResolver(): void {
		this.getCategoryList();
	}

	setMetaTags(): void {
		const title: string = 'Search categories';
		const description: string = "Use the search to find what you're looking for";

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

	/** CategoryList */

	getCategoryList(categoryListLoadMore: boolean = false): void {
		this.categoryListIsLoading$.next(true);

		/** Algolia */

		const categoryQuery: string = String(this.activatedRoute.snapshot.queryParamMap.get('query') || '');
		const categoryIndex: SearchIndex = this.algoliaService.getSearchIndex('category');
		const categoryIndexSearch: SearchOptions = {
			page: (() => (this.categoryGetAllDto.page = categoryListLoadMore ? this.categoryGetAllDto.page + 1 : 0))(),
			hitsPerPage: this.categoryGetAllDto.size
		};

		this.categoryListRequest$?.unsubscribe();
		this.categoryListRequest$ = from(categoryIndex.search(categoryQuery, categoryIndexSearch)).subscribe({
			next: (searchResponse: SearchResponse<any>) => {
				this.setCategoryListSearchResponse(searchResponse);

				if (this.platformService.isServer()) {
					this.transferState.set(searchResponseKey, searchResponse);
				}
			},
			error: (error: any) => console.error(error)
		});
	}

	setCategoryListSearchResponse(searchResponse: SearchResponse<Category> | null): void {
		const { hits: categoryList, ...categoryListSearchResponse }: any = searchResponse;

		// Set

		this.categoryList = searchResponse.page > 0 ? this.categoryList.concat(categoryList) : categoryList;
		this.categoryListSearchResponse = categoryListSearchResponse;
		this.categoryListSkeletonToggle = false;
		this.categoryListIsLoading$.next(false);
	}
}
