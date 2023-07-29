/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { filter, map, skip, tap } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PostService } from '../../core/services/post.service';
import { CookieService } from '../../core/services/cookie.service';
import { AppearanceService } from '../../core/services/appearance.service';
import { MetaService } from '../../core/services/meta.service';
import { CategoryService } from '../../core/services/category.service';
import { UserService } from '../../core/services/user.service';

@Component({
	selector: 'app-abstract-list',
	template: ''
})
export abstract class AbstractListComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;
	activatedRouteQueryParams$: Subscription | undefined;

	page: number = 1;
	size: number = 20;

	abstractList: any[] = [];
	abstractListHasMore: boolean = false;

	// prettier-ignore
	abstractListLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	abstractListLoadingPageScrollInfinite: boolean = false;
	abstractListLoadingPageScrollInfinite$: Subscription | undefined;

	constructor(
		public activatedRoute: ActivatedRoute,
		public postService: PostService,
		public categoryService: CategoryService,
		public userService: UserService,
		public metaService: MetaService,
		public cookieService: CookieService,
		public appearanceService: AppearanceService
	) {}

	ngOnInit(): void {
		/** Get data by resolver */

		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (abstractList: any[]) => {
					this.abstractList = abstractList;
					this.abstractListHasMore = abstractList.length === this.size;
				},
				error: (error: any) => console.error(error)
			});

		/** Get data by search actions */

		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
			.pipe(
				skip(1),
				tap(() => {
					this.page = 1;
					this.size = 20;

					this.abstractList = [];
					this.abstractListHasMore = false;
				})
			)
			.subscribe({
				next: () => this.getAbstractList(false),
				error: (error: any) => console.error(error)
			});

		/** Set appearance settings */

		this.setAppearance();
	}

	ngOnDestroy(): void {
		[
			this.activatedRouteData$,
			this.activatedRouteQueryParams$,
			this.abstractListLoadingPageScrollInfinite$
		].forEach($ => $?.unsubscribe());
	}

	setAppearance(): void {
		// prettier-ignore
		if (this.cookieService.getItem('page-scroll-infinite')) {
      this.abstractListLoadingPageScrollInfinite = true;
      this.abstractListLoadingPageScrollInfinite$ = this.appearanceService
        .setPageScrollInfiniteHandler()
        .pipe(filter(() => this.abstractListHasMore && !this.abstractListLoading$.getValue()))
        .subscribe({
          next: () => this.getAbstractListLoadMore(),
          error: (error: any) => console.error(error)
        });
    }
	}

	getAbstractList(concat: boolean): void {
		console.debug('getAbstractList', concat);
	}

	getAbstractListLoadMore(): void {
		this.page++;

		this.getAbstractList(true);
	}
}
