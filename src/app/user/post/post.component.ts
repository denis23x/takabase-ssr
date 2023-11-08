/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { AbstractSearchListComponent } from '../../abstracts/abstract-search-list.component';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, CardPostComponent, SvgIconComponent],
	selector: 'app-user-post',
	templateUrl: './post.component.html'
})
export class UserPostComponent extends AbstractSearchListComponent implements OnInit, OnDestroy {
	abstractList: Post[] = [];

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setSkeleton();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();
	}

	setSkeleton(): void {
		this.abstractList = this.skeletonService.getPostList();
		this.abstractListSkeletonToggle = true;
		this.abstractListHasMore = false;
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			this.getAbstractList();
		}
	}

	getAbstractList(concat: boolean = false): void {
		this.abstractListIsLoading$.next(true);

		let postGetAllDto: PostGetAllDto = {
			page: this.abstractPage,
			size: this.abstractSize
		};

		// prettier-ignore
		const userName: string = String(this.activatedRoute.parent.snapshot.paramMap.get('name') || '');

		if (userName) {
			postGetAllDto = {
				...postGetAllDto,
				userName: userName.substring(1)
			};
		}

		const categoryId: number = Number(this.activatedRoute.snapshot.paramMap.get('categoryId'));

		if (categoryId) {
			postGetAllDto = {
				...postGetAllDto,
				categoryId
			};
		}

		postGetAllDto = {
			...this.searchService.getSearchGetAllDto(postGetAllDto, this.activatedRoute.parent.snapshot)
		};

		if (!concat) {
			this.setSkeleton();
		}

		this.abstractListRequest$?.unsubscribe();
		this.abstractListRequest$ = this.postService.getAll(postGetAllDto).subscribe({
			next: (postList: Post[]) => {
				this.abstractList = concat ? this.abstractList.concat(postList) : postList;
				this.abstractListSkeletonToggle = false;
				this.abstractListHasMore = postList.length === this.abstractSize;
				this.abstractListIsLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}
}
