/** @format */

import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { UserUrlPipe } from '../../standalone/pipes/user-url.pipe';
import { Category } from '../../core/models/category.model';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { CategoryGetAllDto } from '../../core/dto/category/category-get-all.dto';
import { AbstractSearchListComponent } from '../../abstracts/abstract-search-list.component';
import { AppSkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { CardCategoryComponent } from '../../standalone/components/card/category/category.component';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		UserUrlPipe,
		SvgIconComponent,
		AppSkeletonDirective,
		CardCategoryComponent
	],
	selector: 'app-search-category',
	templateUrl: './category.component.html'
})
export class SearchCategoryComponent extends AbstractSearchListComponent implements OnInit {
	abstractList: Category[] = [];

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setSkeleton();
		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	setSkeleton(): void {
		this.abstractList = this.skeletonService.getCategoryList(['user']);
		this.abstractListSkeletonToggle = true;
		this.abstractListHasMore = false;
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			this.getAbstractList();
		}
	}

	setMetaTags(): void {
		const title: string = 'Search categories';
		const description: string = "Use our search function to find what you're looking for on Draft";

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

	getAbstractList(concat: boolean = false): void {
		this.abstractListIsLoading$.next(true);

		let categoryGetAllDto: CategoryGetAllDto = {
			page: this.abstractPage || this.abstractPageDefault,
			size: this.abstractSize || this.abstractSizeDefault,
			scope: ['user']
		};

		// Search

		categoryGetAllDto = {
			...this.getAbstractListSearchGetAllDto(categoryGetAllDto)
		};

		if (!concat) {
			this.setSkeleton();
		}

		this.abstractListRequest$?.unsubscribe();
		this.abstractListRequest$ = this.categoryService.getAll(categoryGetAllDto).subscribe({
			next: (categoryList: Category[]) => {
				this.abstractList = concat ? this.abstractList.concat(categoryList) : categoryList;
				this.abstractListSkeletonToggle = false;
				this.abstractListHasMore = categoryList.length === this.abstractSize;
				this.abstractListIsLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}
}
