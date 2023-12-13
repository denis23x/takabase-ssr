/** @format */

import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AbstractSearchListComponent } from '../../abstracts/abstract-search-list.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { AppSkeletonDirective } from '../../standalone/directives/app-skeleton.directive';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SvgIconComponent, CardPostComponent, AppSkeletonDirective],
	selector: 'app-search-post',
	templateUrl: './post.component.html'
})
export class SearchPostComponent extends AbstractSearchListComponent implements OnInit {
	abstractList: Post[] = [];

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setSkeleton();
		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	setSkeleton(): void {
		this.abstractList = this.skeletonService.getPostList();
		this.abstractListSkeletonToggle = true;
		this.abstractListHasMore = false;
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

	getAbstractList(concat: boolean = false): void {
		this.abstractListIsLoading$.next(true);

		let postGetAllDto: PostGetAllDto = {
			page: this.abstractPage || this.abstractPageDefault,
			size: this.abstractSize || this.abstractSizeDefault
		};

		// Search

		postGetAllDto = {
			...this.getAbstractListSearchGetAllDto(postGetAllDto)
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
