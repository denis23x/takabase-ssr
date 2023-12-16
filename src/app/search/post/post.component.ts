/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AbstractSearchListComponent } from '../../abstracts/abstract-search-list.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { AppSkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { PostService } from '../../core/services/post.service';
import { MetaService } from '../../core/services/meta.service';
import { SkeletonService } from '../../core/services/skeleton.service';
import { Subscription } from 'rxjs';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SvgIconComponent, CardPostComponent, AppSkeletonDirective],
	selector: 'app-search-post',
	templateUrl: './post.component.html'
})
export class SearchPostComponent extends AbstractSearchListComponent implements OnInit, OnDestroy {
	postService: PostService = inject(PostService);
	metaService: MetaService = inject(MetaService);
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

				/** Apply SEO meta tags */

				this.setMetaTags();
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// prettier-ignore
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

	setMetaTags(): void {
		const title: string = 'Search posts';
		const description: string = "Use our search function to find what you're looking for on Draft";

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
