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

// prettier-ignore
@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, UserUrlPipe, SvgIconComponent],
	selector: 'app-search-category',
	templateUrl: './category.component.html'
})
export class SearchCategoryComponent extends AbstractListComponent implements OnInit {
	abstractList: Category[] = [];

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	setMetaTags(): void {
		const title: string = 'Search categories';

		// prettier-ignore
		const description: string = 'Use our search function to find what you\'re looking for on Draft';

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

	getAbstractList(concat: boolean): void {
		this.abstractListLoading$.next(true);

		/** Request */

		let categoryGetAllDto: CategoryGetAllDto = {
			page: this.abstractPage,
			size: this.abstractSize,
			scope: ['user']
		};

		// prettier-ignore
		const query: string = String(this.activatedRoute.parent.snapshot.queryParamMap.get('query') || '');

		if (query.length) {
			categoryGetAllDto = {
				...categoryGetAllDto,
        query
			};
		}

    // prettier-ignore
    const orderBy: string = String(this.activatedRoute.parent.snapshot.queryParamMap.get('orderBy') || '');

    if (orderBy.length) {
      categoryGetAllDto = {
        ...categoryGetAllDto,
        orderBy
      };
    }

		this.categoryService.getAll(categoryGetAllDto).subscribe({
			next: (categoryList: Category[]) => {
				this.abstractList = concat ? this.abstractList.concat(categoryList) : categoryList;
				this.abstractListHasMore = categoryList.length === this.abstractSize;
				this.abstractListLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}
}
