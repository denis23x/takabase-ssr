/** @format */

import { Component, makeStateKey, OnDestroy, OnInit, StateKey } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { Category } from '../../core/models/category.model';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { CategoryGetAllDto } from '../../core/dto/category/category-get-all.dto';
import { AbstractSearchComponent } from '../../abstracts/abstract-search.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { CardCategoryComponent } from '../../standalone/components/card/category/category.component';
import { from, Subscription } from 'rxjs';
import { AdComponent } from '../../standalone/components/ad/ad.component';
import { SearchIndex } from 'algoliasearch/lite';
import { SearchOptions, SearchResponse } from '@algolia/client-search';
import { tap } from 'rxjs/operators';

const searchResponseKey: StateKey<SearchResponse> = makeStateKey<SearchResponse>('searchResponse');

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SvgIconComponent, SkeletonDirective, CardCategoryComponent, AdComponent],
	selector: 'app-search-category',
	templateUrl: './category.component.html'
})
export class SearchCategoryComponent extends AbstractSearchComponent implements OnInit, OnDestroy {
	categoryList: Category[] = [];
	categoryListRequest$: Subscription | undefined;
	categoryListSkeletonToggle: boolean = true;

	categoryGetAllDto: CategoryGetAllDto | undefined;
	categoryGetAllDto$: Subscription | undefined;

	ngOnInit(): void {
		super.ngOnInit();

		this.categoryGetAllDto$?.unsubscribe();
		this.categoryGetAllDto$ = this.abstractGetAllDto$
			.pipe(
				tap(() => {
					this.categoryGetAllDto = this.getAbstractGetAllDto();
					this.categoryGetAllDto.scope = ['user'];
				})
			)
			.subscribe({
				next: () => {
					if (this.transferState.hasKey(searchResponseKey)) {
						this.setSearchResponse(this.transferState.get(searchResponseKey, null));

						if (this.platformService.isBrowser()) {
							this.transferState.remove(searchResponseKey);
						}
					} else {
						/** Apply Data */

						this.setSkeleton();
						this.setResolver();

						/** Apply SEO meta tags */

						this.setMetaTags();
					}
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		[this.categoryListRequest$, this.categoryGetAllDto$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.categoryList = this.skeletonService.getCategoryList(['user']);
		this.categoryListSkeletonToggle = true;

		// Hide load more

		this.abstractListIsHasMore = false;
	}

	setResolver(): void {
		this.getAbstractList();
	}

	setSearchResponse(searchResponse: SearchResponse): void {
		const categoryList: Category[] = searchResponse.hits as any[];
		const categoryListIsHasMore: boolean = searchResponse.page !== searchResponse.nbPages - 1;

		this.categoryList = this.categoryGetAllDto.page > 1 ? this.categoryList.concat(categoryList) : categoryList;
		this.categoryListSkeletonToggle = false;

		this.abstractListIsHasMore = categoryListIsHasMore && searchResponse.nbPages > 1;
		this.abstractListIsLoading$.next(false);
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

	getAbstractList(abstractListLoadMore: boolean = false): void {
		this.abstractListIsLoading$.next(true);

		/** Algolia */

		const categoryQuery: string = this.categoryGetAllDto.query?.trim();
		const categoryIndex: SearchIndex = this.algoliaService.getSearchIndex('category');
		const categoryIndexSearch: SearchOptions = {
			page: (() => (abstractListLoadMore ? this.categoryGetAllDto.page++ : (this.categoryGetAllDto.page = 0)))(),
			hitsPerPage: this.categoryGetAllDto.size
		};

		this.categoryListRequest$?.unsubscribe();
		this.categoryListRequest$ = from(categoryIndex.search(categoryQuery, categoryIndexSearch)).subscribe({
			next: (searchResponse: SearchResponse) => {
				this.setSearchResponse(searchResponse);

				if (this.platformService.isServer()) {
					this.transferState.set(searchResponseKey, searchResponse);
				}
			},
			error: (error: any) => console.error(error)
		});
	}
}
