/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { distinctUntilKeyChanged, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { ScrollPresetDirective } from '../../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { SkeletonService } from '../../core/services/skeleton.service';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { SearchFormComponent } from '../../standalone/components/search-form/search-form.component';
import { CopyToClipboardDirective } from '../../standalone/directives/app-copy-to-clipboard.directive';
import { CommonModule } from '@angular/common';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { ListLoadMoreComponent } from '../../standalone/components/list/load-more/load-more.component';
import { ListMockComponent } from '../../standalone/components/list/mock/mock.component';
import { CurrentUserMixin as CU } from '../../core/mixins/current-user.mixin';
import { MasonryMixin as M } from '../../core/mixins/masonry.mixin';
import { SearchPostsMixin as SP } from '../../core/mixins/search-posts.mixin';
import { PostService } from '../../core/services/post.service';
import type { Post } from '../../core/models/post.model';
import type { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import type { CustomSearchResponse } from '../../core/models/custom-search.model';

@Component({
	standalone: true,
	imports: [
		RouterModule,
		CommonModule,
		AvatarComponent,
		ScrollPresetDirective,
		SvgIconComponent,
		DropdownComponent,
		SkeletonDirective,
		SearchFormComponent,
		CopyToClipboardDirective,
		CardPostComponent,
		ListLoadMoreComponent,
		ListMockComponent
	],
	providers: [PostService],
	selector: 'app-user-all',
	templateUrl: './all.component.html'
})
export class UserAllComponent extends CU(M(SP(class {}))) implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly postService: PostService = inject(PostService);

	activatedRouteParamsUsername$: Subscription | undefined;
	activatedRouteQueryParams$: Subscription | undefined;

	postList: Post[] = [];
	postListSkeletonToggle: boolean = true;
	postListIsLoading: boolean = false;
	postListRequest$: Subscription | undefined;
	postListGetAllDto: PostGetAllDto = {
		page: 0,
		size: 20
	};

	// Explicit types

	searchFormToggle: boolean = false;
	searchResponse: CustomSearchResponse;

	ngOnInit(): void {
		super.ngOnInit();

		// ngOnInit

		this.activatedRouteParamsUsername$?.unsubscribe();
		this.activatedRouteParamsUsername$ = this.activatedRoute.params
			.pipe(distinctUntilKeyChanged('username'))
			.subscribe({
				next: () => {
					/** Apply Data */

					this.setSkeleton();
					this.setResolver();
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// ngOnDestroy
		// prettier-ignore
		[this.activatedRouteParamsUsername$, this.activatedRouteQueryParams$, this.postListRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postList = this.skeletonService.getPostList();
		this.postListSkeletonToggle = true;

		if (this.platformService.isBrowser()) {
			this.setMasonry();
		}
	}

	setResolver(): void {
		this.activatedRouteQueryParams$?.unsubscribe();
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
			.pipe(
				distinctUntilKeyChanged('query'),
				tap(() => this.setSkeleton())
			)
			.subscribe({
				next: () => this.getPostList(),
				error: (error: any) => console.error(error)
			});
	}

	/** PostList */

	getPostList(postListLoadMore: boolean = false): void {
		this.postListIsLoading = true;

		const postPage: number = (this.postListGetAllDto.page = postListLoadMore ? this.postListGetAllDto.page + 1 : 1);
		const postUsername: string = String(this.activatedRoute.snapshot.paramMap.get('username') || '');
		const postQuery: string = String(this.activatedRoute.snapshot.queryParamMap.get('query') || '');
		const postGetAllDto: PostGetAllDto = {
			...this.postListGetAllDto,
			username: postUsername,
			page: postPage
		};

		// Query

		if (postQuery) {
			postGetAllDto.query = postQuery;
		}

		this.postListRequest$?.unsubscribe();
		this.postListRequest$ = this.postService.getAll(postGetAllDto).subscribe({
			next: (postList: Post[]) => {
				this.postList = postGetAllDto.page > 1 ? this.postList.concat(postList) : postList;
				this.postListSkeletonToggle = false;
				this.postListIsLoading = false;

				// Search

				this.searchResponse = {
					isOnePage: postGetAllDto.page === 1 && postGetAllDto.size !== postList.length,
					isEndPage: postGetAllDto.page !== 1 && postGetAllDto.size !== postList.length
				};

				// Masonry

				this.setMasonry();
			},
			error: (error: any) => console.error(error)
		});
	}

	// Explicit types
	// @ts-ignore
	onToggleSearchForm(toggle: boolean): void;
}
