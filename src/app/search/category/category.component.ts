/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { UserUrlPipe } from '../../standalone/pipes/user-url.pipe';
import { Category } from '../../core/models/category.model';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { CategoryGetAllDto } from '../../core/dto/category/category-get-all.dto';
import { AbstractSearchComponent } from '../../abstracts/abstract-search.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { CardCategoryComponent } from '../../standalone/components/card/category/category.component';
import { CategoryService } from '../../core/services/category.service';
import { from, Subscription } from 'rxjs';
import { AdComponent } from '../../standalone/components/ad/ad.component';
import { SearchIndex } from 'algoliasearch/lite';
import { SearchOptions, SearchResponse } from '@algolia/client-search';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		UserUrlPipe,
		SvgIconComponent,
		SkeletonDirective,
		CardCategoryComponent,
		AdComponent
	],
	selector: 'app-search-category',
	templateUrl: './category.component.html'
})
export class SearchCategoryComponent extends AbstractSearchComponent implements OnInit, OnDestroy {
	private readonly categoryService: CategoryService = inject(CategoryService);

	categoryList: Category[] = [];
	categoryListRequest$: Subscription | undefined;
	categoryListSkeletonToggle: boolean = true;

	categoryGetAllDto: CategoryGetAllDto | undefined;
	categoryGetAllDto$: Subscription | undefined;

	ngOnInit(): void {
		super.ngOnInit();

		this.categoryGetAllDto$?.unsubscribe();
		this.categoryGetAllDto$ = this.abstractGetAllDto$.subscribe({
			next: () => {
				/** Get abstract DTO */

				this.categoryGetAllDto = this.getAbstractGetAllDto();
				this.categoryGetAllDto.scope = ['user'];

				/** Apply Data */

				this.setSkeleton();
				this.setResolver();

				/** Apply SEO meta tags */

				this.setMetaTags();
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

		this.abstractListIsHasMore = false;
	}

	setResolver(): void {
		this.getAbstractList();
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

	getAbstractList(): void {
		this.abstractListIsLoading$.next(true);

		const concat: boolean = this.categoryGetAllDto.page !== 1;

		if (!concat) {
			this.setSkeleton();
		}

		// prettier-ignore
		if (this.platformService.isBrowser()) {
			const categoryIndex: SearchIndex = this.algoliaService.getSearchIndex('category');
			const categoryIndexSearch: SearchOptions = {
				page: this.categoryGetAllDto.page - 1,
				hitsPerPage: 20
			};

			this.categoryListRequest$?.unsubscribe();
			this.categoryListRequest$ = from(categoryIndex.search(this.categoryGetAllDto.query, categoryIndexSearch)).subscribe({
				next: (searchResponse: SearchResponse) => {
					const categoryList: Category[] = searchResponse.hits as any[];
					const categoryListIsHasMore: boolean = searchResponse.page !== searchResponse.nbPages - 1;

					this.categoryList = concat ? this.categoryList.concat(categoryList) : categoryList;
					this.categoryListSkeletonToggle = false;

					this.abstractListIsHasMore = categoryListIsHasMore && searchResponse.nbPages > 1;
					this.abstractListIsLoading$.next(false);
				},
				error: (error: any) => console.error(error)
			});

			//! Default searching
			// this.categoryListRequest$?.unsubscribe();
			// this.categoryListRequest$ = this.categoryService.getAll(this.categoryGetAllDto).subscribe({
			// 	next: (categoryList: Category[]) => {
			// 		this.categoryList = concat ? this.categoryList.concat(categoryList) : categoryList;
			// 		this.categoryListSkeletonToggle = false;
			//
			// 		this.abstractListIsHasMore = categoryList.length === this.categoryGetAllDto.size;
			// 		this.abstractListIsLoading$.next(false);
			// 	},
			// 	error: (error: any) => console.error(error)
			// });
		}
	}

	getAbstractListLoadMore(): void {
		this.categoryGetAllDto.page++;

		this.getAbstractList();
	}
}
