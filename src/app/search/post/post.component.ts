/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, RouterModule } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter, map, skip, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { PostCardComponent } from '../../standalone/components/post/card/card.component';
import { Post } from '../../core/models/post.model';
import { PostService } from '../../core/services/post.service';
import { MetaService } from '../../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { CookieService } from '../../core/services/cookie.service';
import { AppearanceService } from '../../core/services/appearance.service';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SvgIconComponent, PostCardComponent],
	selector: 'app-search-post',
	templateUrl: './post.component.html'
})
export class SearchPostComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;
	activatedRouteQueryParams$: Subscription | undefined;

	page: number = 1;
	size: number = 20;

	postList: Post[] = [];
	postListHasMore: boolean = false;

	// prettier-ignore
	postListLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	postListLoadingPageScrollInfinite$: Subscription | undefined;

	constructor(
		private activatedRoute: ActivatedRoute,
		private postService: PostService,
		private metaService: MetaService,
		private cookieService: CookieService,
		private appearanceService: AppearanceService
	) {}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (postList: Post[]) => {
					this.postList = postList;
					this.postListHasMore = postList.length === this.size;
				},
				error: (error: any) => console.error(error)
			});

		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
			.pipe(
				skip(1),
				tap(() => {
					this.page = 1;
					this.size = 20;

					this.postList = [];
					this.postListHasMore = false;
				})
			)
			.subscribe({
				next: () => this.getPostList(false),
				error: (error: any) => console.error(error)
			});

		this.setMeta();

		this.setPageScrollInfinite();
	}

	ngOnDestroy(): void {
		[
			this.activatedRouteData$,
			this.activatedRouteQueryParams$,
			this.postListLoadingPageScrollInfinite$
		].forEach($ => $?.unsubscribe());
	}

	setMeta(): void {
		const title: string = 'Search posts';

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

	setPageScrollInfinite(): void {
		if (this.cookieService.getItem('page-scroll-infinite')) {
			this.postListLoadingPageScrollInfinite$ = this.appearanceService
				.setPageScrollInfiniteHandler()
				.pipe(filter(() => !this.postListLoading$.getValue()))
				.subscribe({
					next: () => this.onPostListLoadMore(),
					error: (error: any) => console.error(error)
				});
		}
	}

	getPostList(concat: boolean): void {
		this.postListLoading$.next(true);

		/** Request */

		let postGetAllDto: PostGetAllDto = {
			page: this.page,
			size: this.size,
			scope: ['user', 'category']
		};

		// prettier-ignore
		postGetAllDto = {
			...this.postService.getSearchPostGetAllDto(postGetAllDto, this.activatedRoute.snapshot)
		};

		this.postService.getAll(postGetAllDto).subscribe({
			next: (postList: Post[]) => {
				this.postList = concat ? this.postList.concat(postList) : postList;
				this.postListHasMore = postList.length === this.size;

				this.postListLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}

	onPostListLoadMore(): void {
		this.page++;

		this.getPostList(true);
	}
}
