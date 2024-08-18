/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { distinctUntilKeyChanged, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { ScrollPresetDirective } from '../../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { SkeletonService } from '../../core/services/skeleton.service';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { CopyToClipboardDirective } from '../../standalone/directives/app-copy-to-clipboard.directive';
import { CommonModule } from '@angular/common';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { CurrentUserMixin as CU } from '../../core/mixins/current-user.mixin';
import { MasonryPostsMixin as MP } from '../../core/mixins/masonry-posts.mixin';
import { SearchPostsMixin as SP } from '../../core/mixins/search-posts.mixin';
import { ListLoadMoreComponent } from '../../standalone/components/list/load-more/load-more.component';
import { ListMockComponent } from '../../standalone/components/list/mock/mock.component';
import { PostBookmarkService } from '../../core/services/post-bookmark.service';
import { SearchFormComponent } from '../../standalone/components/search-form/search-form.component';
import type { Post } from '../../core/models/post.model';
import type { PostBookmark } from '../../core/models/post-bookmark.model';
import type { PostBookmarkGetAllDto } from '../../core/dto/post-bookmark/post-bookmark-get-all.dto';
import type { CustomSearchResponse } from '../../core/models/custom-search.model';

@Component({
	standalone: true,
	imports: [
		RouterModule,
		CommonModule,
		AvatarComponent,
		ScrollPresetDirective,
		SvgIconComponent,
		SanitizerPipe,
		DropdownComponent,
		SkeletonDirective,
		CopyToClipboardDirective,
		CardPostComponent,
		ListLoadMoreComponent,
		ListMockComponent,
		SearchFormComponent
	],
	providers: [PostBookmarkService],
	selector: 'app-user-bookmark',
	templateUrl: './bookmark.component.html'
})
export class UserBookmarkComponent extends CU(MP(SP(class {}))) implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly postBookmarkService: PostBookmarkService = inject(PostBookmarkService);

	activatedRouteQueryParams$: Subscription | undefined;

	postBookmarkList: Post[] = [];
	postBookmarkListSkeletonToggle: boolean = true;
	postBookmarkListIsLoading: boolean = false;
	postBookmarkListRequest$: Subscription | undefined;
	postBookmarkListGetAllDto: PostBookmarkGetAllDto = {
		page: 1,
		size: 20
	};

	// Explicit types

	searchFormToggle: boolean = false;
	searchResponse: CustomSearchResponse;

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setSkeleton();
		this.setResolver();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// prettier-ignore
		[this.activatedRouteQueryParams$, this.postBookmarkListRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postBookmarkList = this.skeletonService.getPostList();
		this.postBookmarkListSkeletonToggle = true;

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
				next: () => this.getPostBookmarkList(),
				error: (error: any) => console.error(error)
			});
	}

	/** PostBookmarkList */

	getPostBookmarkList(postBookmarkListLoadMore: boolean = false): void {
		this.postBookmarkListIsLoading = true;

		// prettier-ignore
		const postBookmarkPage: number = (this.postBookmarkListGetAllDto.page = postBookmarkListLoadMore ? this.postBookmarkListGetAllDto.page + 1 : 1);
		const postBookmarkQuery: string = String(this.activatedRoute.snapshot.queryParamMap.get('query') || '');
		const postBookmarkGetAllDto: PostBookmarkGetAllDto = {
			...this.postBookmarkListGetAllDto,
			page: postBookmarkPage,
			attachPost: true
		};

		// Query

		if (postBookmarkQuery) {
			postBookmarkGetAllDto.query = postBookmarkQuery;
		}

		this.postBookmarkListRequest$?.unsubscribe();
		this.postBookmarkListRequest$ = this.postBookmarkService.getAll(postBookmarkGetAllDto).subscribe({
			next: (postList: (PostBookmark | Post)[]) => {
				const postBookmarkList: Post[] = postList as Post[];

				// prettier-ignore
				this.postBookmarkList = postBookmarkGetAllDto.page > 1 ? this.postBookmarkList.concat(postBookmarkList) : postBookmarkList;
				this.postBookmarkListSkeletonToggle = false;
				this.postBookmarkListIsLoading = false;

				// Search

				this.searchResponse = {
					isOnePage: postBookmarkGetAllDto.page === 1 && postBookmarkGetAllDto.size !== postBookmarkList.length,
					isEndPage: postBookmarkGetAllDto.page !== 1 && postBookmarkGetAllDto.size !== postBookmarkList.length
				};
			},
			error: (error: any) => console.error(error),
			complete: () => this.setMasonry()
		});
	}

	// Explicit types
	// @ts-ignore
	onToggleSearchForm(toggle: boolean): void;
}
