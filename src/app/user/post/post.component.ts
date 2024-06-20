/** @format */

import { Component, inject, makeStateKey, OnDestroy, OnInit, StateKey } from '@angular/core';
import { Params, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { Post } from '../../core/models/post.model';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { AbstractSearchComponent } from '../../abstracts/abstract-search.component';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { distinctUntilChanged, from, Subscription } from 'rxjs';
import { SearchIndex } from 'algoliasearch/lite';
import { SearchOptions, SearchResponse } from '@algolia/client-search';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { filter, tap } from 'rxjs/operators';

const searchResponseKey: StateKey<SearchResponse> = makeStateKey<SearchResponse>('searchResponse');

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, CardPostComponent, SvgIconComponent],
	selector: 'app-user-post',
	templateUrl: './post.component.html'
})
export class UserPostComponent extends AbstractSearchComponent implements OnInit, OnDestroy {
	private readonly userService: UserService = inject(UserService);

	activatedRouteParams$: Subscription | undefined;

	user: User | undefined;
	user$: Subscription | undefined;

	postList: Post[] = [];
	postListRequest$: Subscription | undefined;
	postListSkeletonToggle: boolean = true;

	postGetAllDto: PostGetAllDto | undefined;
	postGetAllDto$: Subscription | undefined;

	ngOnInit(): void {
		super.ngOnInit();

		this.postList = this.skeletonService.getPostList();
		this.postListSkeletonToggle = true;

		this.user$?.unsubscribe();
		this.user$ = this.userService.userTemp.pipe(tap((user: User) => (this.user = user))).subscribe({
			next: () => {
				this.activatedRouteParams$?.unsubscribe();
				this.activatedRouteParams$ = this.activatedRoute.params
					.pipe(
						distinctUntilChanged((previousParams: Params, currentParams: Params) => {
							const userName: boolean = previousParams.userName === currentParams.userName;
							const categoryId: boolean = previousParams.categoryId === currentParams.categoryId;

							return userName && categoryId;
						}),
						tap(() => this.setSkeleton()),
						filter((params: Params) => !!params.userName && this.user?.name === params.userName)
					)
					.subscribe({
						next: () => this.setResolver(),
						error: (error: any) => console.error(error)
					});
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// prettier-ignore
		[this.user$, this.activatedRouteParams$, this.postListRequest$, this.postGetAllDto$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postList = this.skeletonService.getPostList();
		this.postListSkeletonToggle = true;

		// Hide load more

		this.abstractListIsHasMore = false;
	}

	setResolver(): void {
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
						this.getAbstractList();
					}
				},
				error: (error: any) => console.error(error)
			});
	}

	setSearchResponse(searchResponse: SearchResponse): void {
		const postList: Post[] = searchResponse.hits as any[];
		const postListIsHasMore: boolean = searchResponse.page !== searchResponse.nbPages - 1;

		this.postList = this.postGetAllDto.page > 1 ? this.postList.concat(postList) : postList;
		this.postListSkeletonToggle = false;

		this.abstractListIsHasMore = postListIsHasMore && searchResponse.nbPages > 1;
		this.abstractListIsLoading$.next(false);
	}

	getAbstractList(): void {
		this.abstractListIsLoading$.next(true);

		/** Algolia */

		const postQuery: string = this.postGetAllDto.query?.trim();
		const postIndex: SearchIndex = this.algoliaService.getSearchIndex('post');
		const postIndexFilters: string[] = [];

		const userId: string = String(this.user.id);
		const categoryId: string = String(this.activatedRoute.snapshot.paramMap.get('categoryId') || '');

		if (userId) {
			postIndexFilters.push('user.id:' + userId);
		}

		if (categoryId) {
			postIndexFilters.push('category.id:' + categoryId);
		}

		const postIndexSearch: SearchOptions = {
			page: this.postGetAllDto.page - 1,
			hitsPerPage: this.postGetAllDto.size,
			filters: postIndexFilters.join(' AND ')
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
