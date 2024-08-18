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
import { SearchFormComponent } from '../../standalone/components/search-form/search-form.component';
import { PostPasswordService } from '../../core/services/post-password.service';
import { HelperService } from '../../core/services/helper.service';
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
		SanitizerPipe,
		DropdownComponent,
		SkeletonDirective,
		CopyToClipboardDirective,
		CardPostComponent,
		ListLoadMoreComponent,
		ListMockComponent,
		SearchFormComponent
	],
	providers: [PostPasswordService],
	selector: 'app-user-password',
	templateUrl: './password.component.html'
})
export class UserPasswordComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly postPasswordService: PostPasswordService = inject(PostPasswordService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly router: Router = inject(Router);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly platformService: PlatformService = inject(PlatformService);

	activatedRouteQueryParams$: Subscription | undefined;
	resize$: Subscription | undefined;

	masonryColumns: Post[][] = [];
	masonryColumnsWeights: number[] = [];

	postPasswordList: Post[] = [];
	postPasswordListSkeletonToggle: boolean = true;
	postPasswordListIsLoading: boolean = false;
	postPasswordListRequest$: Subscription | undefined;
	postPasswordListGetAllDto: PostGetAllDto = {
		page: 0,
		size: 20
	};

	postPasswordListSearchFormToggle: boolean = false;
	postPasswordListSearchResponse: any;

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
					next: () => this.setPostPasswordListMasonry(this.postPasswordList),
					error: (error: any) => console.error(error)
				});
		}
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// prettier-ignore
		[this.activatedRouteQueryParams$, this.postPasswordListRequest$, this.resize$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postPasswordList = this.skeletonService.getPostList();
		this.postPasswordListSkeletonToggle = true;

		if (this.platformService.isBrowser()) {
			this.setPostPasswordListMasonry(this.postPasswordList);
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
				next: () => this.getPostPasswordList(),
				error: (error: any) => console.error(error)
			});
	}

	/** Search */

	onToggleSearchForm(toggle: boolean): void {
		if (toggle) {
			this.postPasswordListSearchFormToggle = true;
		} else {
			this.postPasswordListSearchFormToggle = false;

			this.router
				.navigate([], {
					relativeTo: this.activatedRoute,
					queryParams: null,
					replaceUrl: true
				})
				.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
		}
	}

	/** PostPasswordList */

	getPostPasswordList(postPasswordListLoadMore: boolean = false): void {
		this.postPasswordListIsLoading = true;

		// prettier-ignore
		const postPasswordPage: number = (this.postPasswordListGetAllDto.page = postPasswordListLoadMore ? this.postPasswordListGetAllDto.page + 1 : 1);
		const postPasswordQuery: string = String(this.activatedRoute.snapshot.queryParamMap.get('query') || '');
		const postPasswordGetAllDto: PostGetAllDto = {
			...this.postPasswordListGetAllDto,
			page: postPasswordPage
		};

		// Query

		if (postPasswordQuery) {
			postPasswordGetAllDto.query = postPasswordQuery;
		}

		this.postPasswordListRequest$?.unsubscribe();
		this.postPasswordListRequest$ = this.postPasswordService.getAll(postPasswordGetAllDto).subscribe({
			next: (postPasswordList: Post[]) => {
				// prettier-ignore
				this.postPasswordList = postPasswordGetAllDto.page > 1 ? this.postPasswordList.concat(postPasswordList) : postPasswordList;
				this.postPasswordListSkeletonToggle = false;
				this.postPasswordListIsLoading = false;
				this.postPasswordListSearchResponse = {
					isOnePage: postPasswordGetAllDto.page === 1 && postPasswordGetAllDto.size !== postPasswordList.length,
					isEndPage: postPasswordGetAllDto.page !== 1 && postPasswordGetAllDto.size !== postPasswordList.length
				};
			},
			error: (error: any) => console.error(error),
			complete: () => this.setPostPasswordListMasonry(this.postPasswordList)
		});
	}

	setPostPasswordListMasonry(postPasswordList: Post[]): void {
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

		postPasswordList.forEach((post: Post) => {
			const index: number = this.masonryColumnsWeights.indexOf(Math.min(...this.masonryColumnsWeights));

			this.masonryColumns[index].push(post);
			this.masonryColumnsWeights[index] += post.image ? 2.5 : 1;
		});
	}
}
