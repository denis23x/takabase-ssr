/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router, RouterModule } from '@angular/router';
import { map, skip, tap } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { UserUrlPipe } from '../../standalone/pipes/user-url.pipe';
import { Category } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { MetaService } from '../../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { CategoryGetAllDto } from '../../core/dto/category/category-get-all.dto';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, UserUrlPipe, SvgIconComponent],
	selector: 'app-search-category',
	templateUrl: './category.component.html'
})
export class SearchCategoryComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;
	activatedRouteQueryParams$: Subscription | undefined;

	page: number = 1;
	size: number = 20;

	categoryList: Category[] = [];
	categoryListHasMore: boolean = false;

	// prettier-ignore
	categoryListLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private categoryService: CategoryService,
		private metaService: MetaService
	) {}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (categoryList: Category[]) => {
					this.categoryList = categoryList;
					this.categoryListHasMore = categoryList.length === this.size;
				},
				error: (error: any) => console.error(error)
			});

		this.activatedRouteQueryParams$ = this.activatedRoute.parent.queryParams
			.pipe(
				skip(1),
				tap(() => {
					this.page = 1;
					this.size = 20;

					this.categoryList = [];
					this.categoryListHasMore = false;

					this.categoryListLoading.next(true);
				})
			)
			.subscribe({
				next: () => this.getCategoryList(false),
				error: (error: any) => console.error(error)
			});

		this.setMeta();
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.activatedRouteData$, this.activatedRouteQueryParams$].forEach($ => $?.unsubscribe());
	}

	setMeta(): void {
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

	getCategoryList(concat: boolean): void {
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
				// prettier-ignore
				this.categoryList = concat ? this.categoryList.concat(categoryList) : categoryList;
				this.categoryListHasMore = categoryList.length === this.size;

				this.categoryListLoading.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}

	onCategoryListLoadMore(): void {
		this.page++;

		this.getCategoryList(true);
	}
}
