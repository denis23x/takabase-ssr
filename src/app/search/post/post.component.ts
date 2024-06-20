/** @format */

import { Component, OnDestroy, OnInit, makeStateKey, StateKey } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AbstractSearchComponent } from '../../abstracts/abstract-search.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { from, Subscription } from 'rxjs';
import { AdComponent } from '../../standalone/components/ad/ad.component';
import { SearchIndex } from 'algoliasearch/lite';
import { SearchOptions, SearchResponse } from '@algolia/client-search';
import { tap } from 'rxjs/operators';

const searchResponseKey: StateKey<SearchResponse> = makeStateKey<SearchResponse>('searchResponse');

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SvgIconComponent, CardPostComponent, SkeletonDirective, AdComponent],
	selector: 'app-search-post',
	templateUrl: './post.component.html'
})
export class SearchPostComponent extends AbstractSearchComponent implements OnInit, OnDestroy {
	postList: Post[] = [];
	postListRequest$: Subscription | undefined;
	postListSkeletonToggle: boolean = true;

	postGetAllDto: PostGetAllDto | undefined;
	postGetAllDto$: Subscription | undefined;

	ngOnInit(): void {
		super.ngOnInit();

		this.postGetAllDto$?.unsubscribe();
		this.postGetAllDto$ = this.abstractGetAllDto$
			.pipe(tap(() => (this.postGetAllDto = this.getAbstractGetAllDto())))
			.subscribe({
				next: () => {
					if (this.transferState.hasKey(searchResponseKey)) {
						this.setSearchResponse(this.transferState.get(searchResponseKey, null));

						if (this.platformService.isBrowser()) {
							this.transferState.remove(searchResponseKey);
						}
					} else {
						/** Apply Data */

						this.setSkeleton();
						this.setResolver();

						/** Apply SEO meta tags */

						this.setMetaTags();
					}
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

		// Hide load more

		this.abstractListIsHasMore = false;
	}

	setResolver(): void {
		this.getAbstractList();
	}

	setSearchResponse(searchResponse: SearchResponse): void {
		const postList: Post[] = searchResponse.hits as any[];
		const postListIsHasMore: boolean = searchResponse.page !== searchResponse.nbPages - 1;

		this.postList = this.postGetAllDto.page > 1 ? this.postList.concat(postList) : postList;
		this.postListSkeletonToggle = false;

		this.abstractListIsHasMore = postListIsHasMore && searchResponse.nbPages > 1;
		this.abstractListIsLoading$.next(false);
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

		/** Algolia */

		const postQuery: string = this.postGetAllDto.query?.trim();
		const postIndex: SearchIndex = this.algoliaService.getSearchIndex('post');
		const postIndexSearch: SearchOptions = {
			page: this.postGetAllDto.page - 1,
			hitsPerPage: this.postGetAllDto.size
		};

		this.postListRequest$?.unsubscribe();
		this.postListRequest$ = from(postIndex.search(postQuery, postIndexSearch)).subscribe({
			next: (searchResponse: SearchResponse) => {
				this.setSearchResponse(searchResponse);

				if (this.platformService.isServer()) {
					this.transferState.set(searchResponseKey, searchResponse);
				}
			},
			error: (error: any) => console.error(error)
		});
	}

	getAbstractListLoadMore(): void {
		this.postGetAllDto.page++;

		this.getAbstractList();
	}
}
