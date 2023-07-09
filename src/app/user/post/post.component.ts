/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, skip, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { PostCardComponent } from '../../standalone/components/post/card/card.component';
import { Post } from '../../core/models/post.model';
import { PostService } from '../../core/services/post.service';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, PostCardComponent, SvgIconComponent],
	selector: 'app-user-post',
	templateUrl: './post.component.html'
})
export class UserPostComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;
	activatedRouteQueryParams$: Subscription | undefined;

	page: number = 1;
	size: number = 20;

	postList: Post[] = [];
	postListLoading: boolean = false;
	postListHasMore: boolean = false;

	constructor(
		private activatedRoute: ActivatedRoute,
		private postService: PostService
	) {}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (postList: Post[]) => {
					this.page = 1;
					this.size = 20;

					this.postList = postList;
					this.postListLoading = false;
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
					this.postListLoading = true;
					this.postListHasMore = false;
				})
			)
			.subscribe({
				next: () => this.getPostList(false),
				error: (error: any) => console.error(error)
			});
	}

	// prettier-ignore
	ngOnDestroy(): void {
    [this.activatedRouteData$, this.activatedRouteQueryParams$].forEach($ => $?.unsubscribe());
  }

	getPostList(concat: boolean): void {
		let postGetAllDto: PostGetAllDto = {
			page: this.page,
			size: this.size,
			scope: ['user', 'category']
		};

		// prettier-ignore
		postGetAllDto = {
			...this.postService.getUserPostGetAllDto(postGetAllDto, this.activatedRoute.snapshot)
		};

		this.postService.getAll(postGetAllDto).subscribe({
			next: (postList: Post[]) => {
				this.postList = concat ? this.postList.concat(postList) : postList;
				this.postListLoading = false;
				this.postListHasMore = postList.length === this.size;
			},
			error: (error: any) => console.error(error)
		});
	}

	onPostListLoadMore(): void {
		this.page++;

		this.getPostList(true);
	}
}
