/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { distinctUntilChanged, distinctUntilKeyChanged, fromEvent, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
import { ListLoadMoreComponent } from '../../standalone/components/list/load-more/load-more.component';
import { ListMockComponent } from '../../standalone/components/list/mock/mock.component';
import { PostBookmarkService } from '../../core/services/post-bookmark.service';
import { HelperService } from '../../core/services/helper.service';
import { SearchFormComponent } from '../../standalone/components/search-form/search-form.component';
import { PlatformService } from '../../core/services/platform.service';
import type { Post } from '../../core/models/post.model';
import type { PostBookmark } from '../../core/models/post-bookmark.model';
import type { PostBookmarkGetAllDto } from '../../core/dto/post-bookmark/post-bookmark-get-all.dto';

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
export class UserBookmarkComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly postBookmarkService: PostBookmarkService = inject(PostBookmarkService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly router: Router = inject(Router);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly platformService: PlatformService = inject(PlatformService);

	activatedRouteQueryParams$: Subscription | undefined;
	resize$: Subscription | undefined;

	masonryColumns: Post[][] = [];
	masonryColumnsWeights: number[] = [];

	postBookmarkList: Post[] = [];
	postBookmarkListSkeletonToggle: boolean = true;
	postBookmarkListIsLoading: boolean = false;
	postBookmarkListRequest$: Subscription | undefined;
	postBookmarkListGetAllDto: PostBookmarkGetAllDto = {
		page: 1,
		size: 20
	};

	postBookmarkListSearchFormToggle: boolean = false;
	postBookmarkListSearchResponse: any;

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setSkeleton();
		this.setResolver();

		/** Toggle SearchForm component */

		if (this.activatedRoute.snapshot.queryParamMap.get('query')) {
			this.onToggleSearchForm(true);
		} else {
			this.onToggleSearchForm(false);
		}

		/** Masonry re-render */

		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			this.resize$?.unsubscribe();
			this.resize$ = fromEvent(window, 'resize')
				.pipe(
					map(() => this.platformService.getBreakpoint()),
					distinctUntilChanged()
				)
				.subscribe({
					next: () => this.setPostBookmarkListMasonry(this.postBookmarkList),
					error: (error: any) => console.error(error)
				});
		}
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// prettier-ignore
		[this.activatedRouteQueryParams$, this.postBookmarkListRequest$, this.resize$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postBookmarkList = this.skeletonService.getPostList();
		this.postBookmarkListSkeletonToggle = true;

		if (this.platformService.isBrowser()) {
			this.setPostBookmarkListMasonry(this.postBookmarkList);
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

	/** Search */

	onToggleSearchForm(toggle: boolean): void {
		if (toggle) {
			this.postBookmarkListSearchFormToggle = true;
		} else {
			this.postBookmarkListSearchFormToggle = false;

			this.router
				.navigate([], {
					relativeTo: this.activatedRoute,
					queryParams: null,
					replaceUrl: true
				})
				.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
		}
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
				this.postBookmarkListSearchResponse = {
					isOnePage: postBookmarkGetAllDto.page === 1 && postBookmarkGetAllDto.size !== postBookmarkList.length,
					isEndPage: postBookmarkGetAllDto.page !== 1 && postBookmarkGetAllDto.size !== postBookmarkList.length
				};
			},
			error: (error: any) => console.error(error),
			complete: () => this.setPostBookmarkListMasonry(this.postBookmarkList)
		});
	}

	setPostBookmarkListMasonry(postBookmarkList: Post[]): void {
		const breakpoint: string = this.platformService.getBreakpoint();
		const breakpointMap: Record<string, number> = {
			xs: 2,
			sm: 3,
			md: 4,
			lg: 4,
			xl: 4
		};
		const breakpointColumns: number = breakpointMap[breakpoint] || Math.max(...Object.values(breakpointMap));
		const breakpointColumnsArray: null[] = Array(breakpointColumns).fill(null);

		this.masonryColumns = [...breakpointColumnsArray.map(() => [])];
		this.masonryColumnsWeights = breakpointColumnsArray.map(() => 0);

		// Draw Masonry

		postBookmarkList.forEach((post: Post) => {
			const index: number = this.masonryColumnsWeights.indexOf(Math.min(...this.masonryColumnsWeights));

			this.masonryColumns[index].push(post);
			this.masonryColumnsWeights[index] += post.image ? 2.5 : 1;
		});
	}
}
