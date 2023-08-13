/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { PostCardComponent } from '../../standalone/components/post/card/card.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { AbstractListComponent } from '../../abstracts/abstract-list.component';

// prettier-ignore
@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, PostCardComponent, SvgIconComponent],
	selector: 'app-user-post',
	templateUrl: './post.component.html'
})
export class UserPostComponent extends AbstractListComponent implements OnInit, OnDestroy {
	abstractList: Post[] = [];

	ngOnInit(): void {
		super.ngOnInit();

		/** Meta? */
	}

	getAbstractList(concat: boolean): void {
		this.abstractListLoading$.next(true);

		/** Request */

		let postGetAllDto: PostGetAllDto = {
			page: this.abstractPage,
			size: this.abstractSize,
			scope: ['user', 'category']
		};

		// prettier-ignore
		postGetAllDto = {
			...this.postService.getUserPostGetAllDto(postGetAllDto, this.activatedRoute.snapshot)
		};

		this.postService.getAll(postGetAllDto).subscribe({
			next: (postList: Post[]) => {
				this.abstractList = concat ? this.abstractList.concat(postList) : postList;
				this.abstractListHasMore = postList.length === this.abstractSize;
        this.abstractListLoading$.next(false);
			},
			error: (error: any) => console.error(error)
		});
	}
}
