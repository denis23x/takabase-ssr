/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AbstractSearchComponent } from '../../abstracts/abstract-search.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { PostService } from '../../core/services/post.service';
import { from, Subscription } from 'rxjs';
import { AdComponent } from '../../standalone/components/ad/ad.component';
import { SearchOptions, SearchResponse } from '@algolia/client-search';
import { SearchIndex } from 'algoliasearch/lite';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SvgIconComponent, CardPostComponent, SkeletonDirective, AdComponent],
	selector: 'app-search-post',
	templateUrl: './post.component.html'
})
export class SearchPostComponent extends AbstractSearchComponent implements OnInit, OnDestroy {
	private readonly postService: PostService = inject(PostService);

	postList: Post[] = [];
	postListRequest$: Subscription | undefined;
	postListSkeletonToggle: boolean = true;

	postGetAllDto: PostGetAllDto | undefined;
	postGetAllDto$: Subscription | undefined;

	ngOnInit(): void {
		super.ngOnInit();

		this.postGetAllDto$?.unsubscribe();
		this.postGetAllDto$ = this.abstractGetAllDto$.subscribe({
			next: () => {
				/** Get abstract DTO */

				this.postGetAllDto = this.getAbstractGetAllDto();

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

		[this.postListRequest$, this.postGetAllDto$].forEach(($: Subscription) => $?.unsubscribe());
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
		const description: string = "Use the search to find what you're looking for";

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

		const concat: boolean = this.postGetAllDto.page !== 1;

		if (!concat) {
			this.setSkeleton();
		}

		if (this.platformService.isBrowser()) {
			const postIndex: SearchIndex = this.algoliaService.getSearchIndex('post');
			const postIndexSearch: SearchOptions = {
				page: this.postGetAllDto.page - 1,
				hitsPerPage: 20
			};

			this.postListRequest$?.unsubscribe();
			this.postListRequest$ = from(postIndex.search(this.postGetAllDto.query, postIndexSearch)).subscribe({
				next: (searchResponse: SearchResponse) => {
					const postList: Post[] = searchResponse.hits as any[];
					const postListIsHasMore: boolean = searchResponse.page !== searchResponse.nbPages - 1;

					this.postList = concat ? this.postList.concat(postList) : postList;
					this.postListSkeletonToggle = false;

					this.abstractListIsHasMore = postListIsHasMore && searchResponse.nbPages > 1;
					this.abstractListIsLoading$.next(false);
				},
				error: (error: any) => console.error(error)
			});

			//! Default searching
			// this.postListRequest$?.unsubscribe();
			// this.postListRequest$ = this.postService.getAll(this.postGetAllDto).subscribe({
			// 	next: (postList: Post[]) => {
			// 		this.postList = concat ? this.postList.concat(postList) : postList;
			// 		this.postListSkeletonToggle = false;
			//
			// 		this.abstractListIsHasMore = postList.length === this.postGetAllDto.size;
			// 		this.abstractListIsLoading$.next(false);
			// 	},
			// 	error: (error: any) => console.error(error)
			// });
		}
	}

	getAbstractListLoadMore(): void {
		this.postGetAllDto.page++;

		this.getAbstractList();
	}
}
