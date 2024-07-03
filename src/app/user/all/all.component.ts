/** @format */

import {
	Component,
	inject,
	Input,
	makeStateKey,
	numberAttribute,
	OnDestroy,
	OnInit,
	signal,
	StateKey,
	TransferState,
	WritableSignal
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { distinctUntilKeyChanged, from, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
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
import { Post } from '../../core/models/post.model';
import { SearchIndex } from 'algoliasearch/lite';
import { SearchOptions, SearchResponse } from '@algolia/client-search';
import { PlatformService } from '../../core/services/platform.service';
import { AlgoliaService } from '../../core/services/algolia.service';
import { CookiesService } from '../../core/services/cookies.service';
import { AppearanceService } from '../../core/services/appearance.service';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { HelperService } from '../../core/services/helper.service';

const searchResponseKey: StateKey<SearchResponse> = makeStateKey<SearchResponse>('searchResponse');

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
		CardPostComponent
	],
	selector: 'app-user-all',
	templateUrl: './all.component.html'
})
export class UserAllComponent implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly transferState: TransferState = inject(TransferState);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly algoliaService: AlgoliaService = inject(AlgoliaService);
	private readonly cookiesService: CookiesService = inject(CookiesService);
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly router: Router = inject(Router);
	private readonly helperService: HelperService = inject(HelperService);

	@Input({ transform: numberAttribute })
	set deleteId(deleteId: number | undefined) {
		if (deleteId) {
			this.router
				.navigate([], {
					queryParams: {
						...this.activatedRoute.snapshot.queryParams,
						deleteId: null
					},
					queryParamsHandling: 'merge',
					relativeTo: this.activatedRoute,
					replaceUrl: true
				})
				.then(() => (this.postList = this.postList.filter((post: Post) => post.id !== deleteId)));
		}
	}

	activatedRouteParamsUsername$: Subscription | undefined;
	activatedRouteQueryParams$: Subscription | undefined;

	postList: Post[] = [];
	postListRequest$: Subscription | undefined;
	postListSkeletonToggle: boolean = true;
	postListSearchFormToggle: boolean = false;
	postListIsHasMore: boolean = false;
	postListIsLoading: WritableSignal<boolean> = signal(false);
	postListPageScrollInfinite: boolean = false;
	postListPageScrollInfinite$: Subscription | undefined;
	postListGetAllDto: PostGetAllDto = {
		page: 0,
		size: 20
	};

	ngOnInit(): void {
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

		/** Apply appearance settings */

		this.setAppearance();
	}

	ngOnDestroy(): void {
		[
			this.activatedRouteParamsUsername$,
			this.activatedRouteQueryParams$,
			this.postListRequest$,
			this.postListPageScrollInfinite$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.postList = this.skeletonService.getPostList();
		this.postListSkeletonToggle = true;
		this.postListIsHasMore = false;
	}

	setResolver(): void {
		this.activatedRouteQueryParams$?.unsubscribe();
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
			.pipe(
				distinctUntilKeyChanged('query'),
				tap(() => this.setSkeleton())
			)
			.subscribe({
				next: () => {
					if (this.transferState.hasKey(searchResponseKey)) {
						this.setPostListSearchResponse(this.transferState.get(searchResponseKey, null));

						if (this.platformService.isBrowser()) {
							this.transferState.remove(searchResponseKey);
						}
					} else {
						this.getPostList();
					}
				},
				error: (error: any) => console.error(error)
			});

		/** Toggle SearchForm component */

		if (this.activatedRoute.snapshot.queryParamMap.get('query')) {
			this.onToggleSearchForm(true);
		} else {
			this.onToggleSearchForm(false);
		}
	}

	setAppearance(): void {
		this.postListPageScrollInfinite = !!Number(this.cookiesService.getItem('page-scroll-infinite'));

		if (this.postListPageScrollInfinite) {
			this.postListPageScrollInfinite$?.unsubscribe();
			this.postListPageScrollInfinite$ = this.appearanceService
				.getPageScrollInfinite()
				.pipe(filter(() => this.postListIsHasMore && !this.postListIsLoading()))
				.subscribe({
					next: () => this.getPostList(true),
					error: (error: any) => console.error(error)
				});
		}
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
		this.postListIsLoading.set(true);

		/** Params */

		const username: string = String(this.activatedRoute.snapshot.paramMap.get('username') || '');

		/** Algolia */

		const postQuery: string = String(this.activatedRoute.snapshot.queryParamMap.get('query') || '');
		const postIndex: SearchIndex = this.algoliaService.getSearchIndex('post');
		const postIndexFilters: string[] = ['user.name:' + username];
		const postIndexSearch: SearchOptions = {
			page: (() => (this.postListGetAllDto.page = postListLoadMore ? this.postListGetAllDto.page + 1 : 0))(),
			hitsPerPage: this.postListGetAllDto.size,
			filters: postIndexFilters.join(' AND ')
		};

		this.postListRequest$?.unsubscribe();
		this.postListRequest$ = from(postIndex.search(postQuery, postIndexSearch)).subscribe({
			next: (searchResponse: SearchResponse) => {
				this.setPostListSearchResponse(searchResponse);

				if (this.platformService.isServer()) {
					this.transferState.set(searchResponseKey, searchResponse);
				}
			},
			error: (error: any) => console.error(error)
		});
	}

	setPostListSearchResponse(searchResponse: SearchResponse): void {
		const postList: Post[] = searchResponse.hits as any[];
		const postListIsHasMore: boolean = searchResponse.page !== searchResponse.nbPages - 1;

		this.postList = this.postListGetAllDto.page >= 1 ? this.postList.concat(postList) : postList;
		this.postListSkeletonToggle = false;
		this.postListIsHasMore = postListIsHasMore && searchResponse.nbPages > 1;
		this.postListIsLoading.set(false);
	}
}
