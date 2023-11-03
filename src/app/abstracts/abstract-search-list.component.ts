/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PostService } from '../core/services/post.service';
import { CookieService } from '../core/services/cookie.service';
import { AppearanceService } from '../core/services/appearance.service';
import { MetaService } from '../core/services/meta.service';
import { CategoryService } from '../core/services/category.service';
import { UserService } from '../core/services/user.service';
import { SkeletonService } from '../core/services/skeleton.service';
import { PlatformService } from '../core/services/platform.service';
import { SearchService } from '../core/services/search.service';

@Component({
	selector: 'app-abstract-search-list',
	template: ''
})
export abstract class AbstractSearchListComponent implements OnInit, OnDestroy {
	activatedRouteQueryParams$: Subscription | undefined;

	abstractPage: number = 1;
	abstractSize: number = 20;

	abstractList: any[] = [];
	abstractListRequest$: Subscription | undefined;
	abstractListSkeletonToggle: boolean = true;
	abstractListIsLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	abstractListHasMore: boolean = false;

	abstractListPageScrollInfinite: boolean = false;
	abstractListPageScrollInfinite$: Subscription | undefined;

	constructor(
		public activatedRoute: ActivatedRoute,
		public postService: PostService,
		public categoryService: CategoryService,
		public userService: UserService,
		public metaService: MetaService,
		public cookieService: CookieService,
		public appearanceService: AppearanceService,
		public skeletonService: SkeletonService,
		public platformService: PlatformService,
		public searchService: SearchService
	) {}

	ngOnInit(): void {
		/** Apply Data */

		this.setAbstractResolver();

		/** Apply appearance settings */

		this.setAbstractAppearance();
	}

	ngOnDestroy(): void {
		[
			this.activatedRouteQueryParams$,
			this.abstractListRequest$,
			this.abstractListPageScrollInfinite$
		].forEach(($: Subscription) => $?.unsubscribe());

		[this.abstractListIsLoading$].forEach(($: BehaviorSubject<boolean>) => $?.complete());
	}

	setAbstractResolver(): void {
		// Get abstractList by search queryParams

		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
			.pipe(
				tap(() => {
					this.abstractPage = 1;
					this.abstractSize = 20;

					this.abstractList = [];
					this.abstractListHasMore = false;
				})
			)
			.subscribe({
				next: () => this.getAbstractList(false),
				error: (error: any) => console.error(error)
			});
	}

	setAbstractAppearance(): void {
		// prettier-ignore
		this.abstractListPageScrollInfinite = !!Number(this.cookieService.getItem('page-scroll-infinite'));

		if (this.abstractListPageScrollInfinite) {
			this.abstractListPageScrollInfinite$ = this.appearanceService
				.setPageScrollInfinite()
				.pipe(filter(() => this.abstractListHasMore && !this.abstractListIsLoading$.getValue()))
				.subscribe({
					next: () => this.getAbstractListLoadMore(),
					error: (error: any) => console.error(error)
				});
		}
	}

	abstract getAbstractList(concat: boolean): void;

	getAbstractListLoadMore(): void {
		this.abstractPage++;

		this.getAbstractList(true);
	}
}
