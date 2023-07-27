/** @format */

import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { UserUrlPipe } from '../../standalone/pipes/user-url.pipe';
import { Category } from '../../core/models/category.model';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { CategoryGetAllDto } from '../../core/dto/category/category-get-all.dto';
import { AbstractListComponent } from '../../standalone/abstracts/abstract-list.component';

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

		/** Meta */

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
			page: this.page,
			size: this.size,
			scope: ['user']
		};

		// prettier-ignore
		const name: string = String(this.activatedRoute.parent.snapshot.queryParamMap.get('query') || '');

		if (name.length) {
			categoryGetAllDto = {
				...categoryGetAllDto,
				name
			};
		}

		this.categoryService.getAll(categoryGetAllDto).subscribe({
			next: (categoryList: Category[]) => {
				this.abstractList = concat ? this.abstractList.concat(categoryList) : categoryList;
				this.abstractListHasMore = categoryList.length === this.size;
				this.abstractListLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}
}
