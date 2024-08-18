/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { distinctUntilChanged, distinctUntilKeyChanged, fromEvent, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
import { HelperService } from '../../core/services/helper.service';
import { ListLoadMoreComponent } from '../../standalone/components/list/load-more/load-more.component';
import { ListMockComponent } from '../../standalone/components/list/mock/mock.component';
import { CurrentUserMixin as CU } from '../../core/mixins/current-user.mixin';
import { PostService } from '../../core/services/post.service';
import { PlatformService } from '../../core/services/platform.service';
import type { Post } from '../../core/models/post.model';
import type { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';

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
export class UserAllComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly postService: PostService = inject(PostService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly router: Router = inject(Router);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly platformService: PlatformService = inject(PlatformService);

	activatedRouteParamsUsername$: Subscription | undefined;
	activatedRouteQueryParams$: Subscription | undefined;
	resize$: Subscription | undefined;

	masonryColumns: Post[][] = [];
	masonryColumnsWeights: number[] = [];

	postList: Post[] = [];
	postListSkeletonToggle: boolean = true;
	postListIsLoading: boolean = false;
	postListRequest$: Subscription | undefined;
	postListGetAllDto: PostGetAllDto = {
		page: 0,
		size: 20
	};

	postListSearchFormToggle: boolean = false;
	postListSearchResponse: any;

	ngOnInit(): void {
		super.ngOnInit();

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
					next: () => this.setPostListMasonry(this.postList),
					error: (error: any) => console.error(error)
				});
		}
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// prettier-ignore
		[this.activatedRouteParamsUsername$, this.activatedRouteQueryParams$, this.postListRequest$, this.resize$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postList = this.skeletonService.getPostList();
		this.postListSkeletonToggle = true;

		if (this.platformService.isBrowser()) {
			this.setPostListMasonry(this.postList);
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

	/** Search */

	onToggleSearchForm(toggle: boolean): void {
		if (toggle) {
			this.postListSearchFormToggle = true;
		} else {
			this.postListSearchFormToggle = false;

			this.router
				.navigate([], {
					relativeTo: this.activatedRoute,
					queryParams: null,
					replaceUrl: true
				})
				.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
		}
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
				this.postListSearchResponse = {
					isOnePage: postGetAllDto.page === 1 && postGetAllDto.size !== postList.length,
					isEndPage: postGetAllDto.page !== 1 && postGetAllDto.size !== postList.length
				};
			},
			error: (error: any) => console.error(error),
			complete: () => this.setPostListMasonry(this.postList)
		});
	}

	setPostListMasonry(postList: Post[]): void {
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

		postList.forEach((post: Post) => {
			const index: number = this.masonryColumnsWeights.indexOf(Math.min(...this.masonryColumnsWeights));

			this.masonryColumns[index].push(post);
			this.masonryColumnsWeights[index] += post.image ? 2.5 : 1;
		});
	}
}
