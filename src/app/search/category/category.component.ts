/** @format */

import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { UserUrlPipe } from '../../standalone/pipes/user-url.pipe';
import { Category } from '../../core/models/category.model';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { CategoryGetAllDto } from '../../core/dto/category/category-get-all.dto';
import { AbstractListComponent } from '../../abstracts/abstract-list.component';
import { AppSkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { CardCategoryComponent } from '../../standalone/components/card/category/category.component';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, UserUrlPipe, SvgIconComponent, AppSkeletonDirective, CardCategoryComponent],
	selector: 'app-search-category',
	templateUrl: './category.component.html'
})
export class SearchCategoryComponent extends AbstractListComponent implements OnInit {
	abstractList: Category[] = [];

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply skeleton */

		this.abstractList = this.skeletonService.getCategoryList(this.abstractSize);
		this.abstractListSkeletonToggle = true;
		this.abstractListHasMore = false;

		this.getAbstractList();

		/** Apply SEO meta tags */

		this.setMetaTags();
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
		this.abstractListLoading$.next(true);

		/** Request */

		let categoryGetAllDto: CategoryGetAllDto = {
			page: this.abstractPage,
			size: this.abstractSize,
			scope: ['user']
		};

		categoryGetAllDto = {
			...this.categoryService.getSearchCategoryGetAllDto(categoryGetAllDto, this.activatedRoute.snapshot)
		};

		this.categoryService.getAll(categoryGetAllDto).subscribe({
			next: (categoryList: Category[]) => {
				this.abstractList = concat ? this.abstractList.concat(categoryList) : categoryList;
				this.abstractListSkeletonToggle = false;
				this.abstractListHasMore = categoryList.length === this.abstractSize;
				this.abstractListLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}
}
