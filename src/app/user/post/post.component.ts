/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { AbstractSearchListComponent } from '../../abstracts/abstract-search-list.component';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { Subscription } from 'rxjs';
import { PostService } from '../../core/services/post.service';
import { SkeletonService } from '../../core/services/skeleton.service';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, CardPostComponent, SvgIconComponent],
	selector: 'app-user-post',
	templateUrl: './post.component.html'
})
export class UserPostComponent extends AbstractSearchListComponent implements OnInit, OnDestroy {
	postService: PostService = inject(PostService);
	skeletonService: SkeletonService = inject(SkeletonService);

	/* --- */

	postList: Post[] = [];
	postListRequest$: Subscription | undefined;
	postListSkeletonToggle: boolean = false;

	postListGetAllDto: PostGetAllDto | undefined;
	postListGetAllDto$: Subscription | undefined;

	ngOnInit(): void {
		super.ngOnInit();

		this.postListGetAllDto$?.unsubscribe();
		this.postListGetAllDto$ = this.abstractListGetAllDto$.subscribe({
			next: () => {
				/** Get abstract DTO */

				this.postListGetAllDto = this.getAbstractListGetAllDto();

				/** Apply Data */

				this.setSkeleton();
				this.setResolver();
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		[this.postListRequest$, this.postListGetAllDto$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postList = this.skeletonService.getPostList();
		this.postListSkeletonToggle = true;

		this.abstractListIsHasMore = false;
	}

	setResolver(): void {
		this.getAbstractList();
	}

	getAbstractList(): void {
		this.abstractListIsLoading$.next(true);

		const concat: boolean = this.postListGetAllDto.page !== 1;

		if (!concat) {
			this.setSkeleton();
		}

		this.postListRequest$?.unsubscribe();
		this.postListRequest$ = this.postService.getAll(this.postListGetAllDto).subscribe({
			next: (postList: Post[]) => {
				this.postList = concat ? this.postList.concat(postList) : postList;
				this.postListSkeletonToggle = false;

				this.abstractListIsHasMore = postList.length === this.postListGetAllDto.size;
				this.abstractListIsLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}

	getAbstractListLoadMore(): void {
		this.postListGetAllDto.page++;

		this.getAbstractList();
	}
}
