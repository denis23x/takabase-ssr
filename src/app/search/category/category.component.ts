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
import { ListMockComponent } from '../../standalone/components/list/mock/mock.component';
import { CookiesService } from '../../core/services/cookies.service';
import { MasonryMixin as M } from '../../core/mixins/masonry.mixin';
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
export class SearchCategoryComponent extends M(class {}) implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly algoliaService: AlgoliaService = inject(AlgoliaService);
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
		super.ngOnInit();

		/** Apply Data */

		this.activatedRouteQueryParams$?.unsubscribe();
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams.pipe(distinctUntilKeyChanged('query')).subscribe({
			next: () => {
				if (this.transferState.hasKey(searchResponseKey)) {
					this.setCategoryListSearchResponse(this.transferState.get(searchResponseKey, null));

					if (this.platformService.isBrowser()) {
						this.transferState.remove(searchResponseKey);
					}
				} else {
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
		super.ngOnDestroy();

		// ngOnDestroy

		[this.activatedRouteQueryParams$, this.categoryListRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.categoryList = this.skeletonService.getCategoryList(['user']);
		this.categoryListSkeletonToggle = true;

		if (this.platformService.isBrowser()) {
			this.setCategoryListMasonry();
		}
	}

	setResolver(): void {
		this.getCategoryList();
	}

	setMetaTags(): void {
		const title: string = 'Discover Categories with Search Tool';

		// prettier-ignore
		const description: string = 'Use Takabase search feature to explore a wide range of categories. Find the perfect category that fits your needs and start exploring content relevant to your interests';

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
			highlightPreTag: '<mark class="bg-success text-success-content">',
			highlightPostTag: '</mark>',
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

		// Set Masonry

		this.setCategoryListMasonry();
	}

	setCategoryListMasonry(): void {
		const breakpoint: string = this.platformService.getBreakpoint();
		const breakpointMap: Record<string, number> = {
			xs: 1,
			sm: 2,
			md: 3
		};

		const breakpointColumns: number = breakpointMap[breakpoint] || Math.max(...Object.values(breakpointMap));
		const breakpointColumnsArray: null[] = Array(breakpointColumns).fill(null);

		this.masonryColumns = [...breakpointColumnsArray.map(() => [])];
		this.masonryColumnsWeights = breakpointColumnsArray.map(() => 0);

		// Draw Masonry

		this.categoryList.forEach((category: Category) => {
			const index: number = this.masonryColumnsWeights.indexOf(Math.min(...this.masonryColumnsWeights));

			this.masonryColumns[index].push(category);
			this.masonryColumnsWeights[index] += category.description ? 2.5 : 1;
		});
	}
}
