/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, skip, tap } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PostService } from '../core/services/post.service';
import { CookieService } from '../core/services/cookie.service';
import { AppearanceService } from '../core/services/appearance.service';
import { MetaService } from '../core/services/meta.service';
import { CategoryService } from '../core/services/category.service';
import { UserService } from '../core/services/user.service';
import { SkeletonService } from '../core/services/skeleton.service';
import { PlatformService } from '../core/services/platform.service';

@Component({
	selector: 'app-abstract-search-list',
	template: ''
})
export abstract class AbstractSearchListComponent implements OnInit, OnDestroy {
	activatedRouteQueryParams$: Subscription | undefined;

	abstractPage: number = 1;
	abstractSize: number = 20;

	abstractList: any[] = [];
	abstractList$: Subscription | undefined;
	abstractListSkeletonToggle: boolean = true;
	abstractListHasMore: boolean = false;

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
		public appearanceService: AppearanceService,
		public skeletonService: SkeletonService,
		public platformService: PlatformService
	) {}

	ngOnInit(): void {
		/** Get data by search actions */

		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
			.pipe(
				skip(1),
				filter(() => !!this.activatedRoute.snapshot.url.length),
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

		/** Apply appearance settings */

		this.setAbstractAppearance();
	}

	ngOnDestroy(): void {
		[
			this.activatedRouteQueryParams$,
			this.abstractList$,
			this.abstractListLoadingPageScrollInfinite$
		].forEach(($: Subscription) => $?.unsubscribe());

		[this.abstractListLoading$].forEach(($: BehaviorSubject<boolean>) => $?.complete());
	}

	setAbstractAppearance(): void {
		// prettier-ignore
		this.abstractListLoadingPageScrollInfinite = !!Number(this.cookieService.getItem('page-scroll-infinite'));

		if (this.abstractListLoadingPageScrollInfinite) {
			this.abstractListLoadingPageScrollInfinite$ = this.appearanceService
				.setPageScrollInfinite()
				.pipe(filter(() => this.abstractListHasMore && !this.abstractListLoading$.getValue()))
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
