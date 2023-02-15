/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, RouterModule } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
	MetaOpenGraph,
	MetaService,
	MetaTwitter,
	Post,
	PostGetAllDto,
	PostService
} from '../../core';
import { map, skip, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon.component';
import { PostCardComponent } from '../../shared/components/post/card/card.component';

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
	postListLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(
		private activatedRoute: ActivatedRoute,
		private postService: PostService,
		private metaService: MetaService
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

					this.postListLoading.next(true);
				})
			)
			.subscribe({
				next: () => this.getPostList(false),
				error: (error: any) => console.error(error)
			});

		this.setMeta();
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.activatedRouteData$, this.activatedRouteQueryParams$].forEach($ => $?.unsubscribe());
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

	getPostList(concat: boolean): void {
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

				this.postListLoading.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}

	onPostListLoadMore(): void {
		this.page++;

		this.getPostList(true);
	}
}
