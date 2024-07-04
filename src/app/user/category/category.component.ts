/** @format */

import {
	Component,
	inject,
	Input,
	makeStateKey,
	numberAttribute,
	OnDestroy,
	OnInit,
	StateKey,
	TransferState,
	ViewChild
} from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router, RouterModule } from '@angular/router';
import { distinctUntilKeyChanged, from, Subscription, switchMap } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { ScrollPresetDirective } from '../../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { DayjsPipe } from '../../standalone/pipes/dayjs.pipe';
import { Category } from '../../core/models/category.model';
import { MarkdownPipe } from '../../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { SkeletonService } from '../../core/services/skeleton.service';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { CategoryUpdateComponent } from '../../standalone/components/category/update/update.component';
import { CategoryDeleteComponent } from '../../standalone/components/category/delete/delete.component';
import { CategoryCreateComponent } from '../../standalone/components/category/create/create.component';
import { CategoryDeleteDto } from '../../core/dto/category/category-delete.dto';
import { SearchFormComponent } from '../../standalone/components/search-form/search-form.component';
import { CopyToClipboardDirective } from '../../standalone/directives/app-copy-to-clipboard.directive';
import { AsyncPipe, CommonModule } from '@angular/common';
import { CardPostComponent } from '../../standalone/components/card/post/post.component';
import { Post } from '../../core/models/post.model';
import { SearchIndex } from 'algoliasearch/lite';
import { SearchOptions, SearchResponse } from '@algolia/client-search';
import { PlatformService } from '../../core/services/platform.service';
import { AlgoliaService } from '../../core/services/algolia.service';
import { PostGetAllDto } from '../../core/dto/post/post-get-all.dto';
import { HelperService } from '../../core/services/helper.service';
import { UserStore } from '../user.store';
import { User } from '../../core/models/user.model';
import { CurrentUserMixin as CU } from '../../core/mixins/current-user.mixin';
import { InfiniteScrollMixin as IS } from '../../core/mixins/infinite-scroll.mixin';

const searchResponseKey: StateKey<SearchResponse> = makeStateKey<SearchResponse>('searchResponse');

@Component({
	standalone: true,
	imports: [
		RouterModule,
		CommonModule,
		AvatarComponent,
		DayjsPipe,
		ScrollPresetDirective,
		SvgIconComponent,
		MarkdownPipe,
		SanitizerPipe,
		DropdownComponent,
		SkeletonDirective,
		CategoryUpdateComponent,
		CategoryDeleteComponent,
		CategoryCreateComponent,
		SearchFormComponent,
		CopyToClipboardDirective,
		AsyncPipe,
		CardPostComponent
	],
	selector: 'app-user-category',
	templateUrl: './category.component.html'
})
export class UserCategoryComponent extends CU(IS(class {})) implements OnInit, OnDestroy {
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly transferState: TransferState = inject(TransferState);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly algoliaService: AlgoliaService = inject(AlgoliaService);
	private readonly router: Router = inject(Router);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly userStore: UserStore = inject(UserStore);

	@ViewChild('appCategoryCreateComponent') appCategoryCreateComponent: CategoryCreateComponent | undefined;
	@ViewChild('appCategoryUpdateComponent') appCategoryUpdateComponent: CategoryUpdateComponent | undefined;
	@ViewChild('appCategoryDeleteComponent') appCategoryDeleteComponent: CategoryDeleteComponent | undefined;

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
	activatedRouteParamsCategoryId$: Subscription | undefined;
	activatedRouteQueryParams$: Subscription | undefined;

	user: User | undefined;
	userSkeletonToggle: boolean = true;

	category: Category | undefined;
	category$: Subscription | undefined;
	categorySkeletonToggle: boolean = true;

	postList: Post[] = [];
	postListRequest$: Subscription | undefined;
	postListSkeletonToggle: boolean = true;
	postListSearchFormToggle: boolean = false;
	postListGetAllDto: PostGetAllDto = {
		page: 0,
		size: 20
	};

	ngOnInit(): void {
		super.ngOnInit();

		this.activatedRouteParamsUsername$?.unsubscribe();
		this.activatedRouteParamsUsername$ = this.activatedRoute.params
			.pipe(
				distinctUntilKeyChanged('username'),
				switchMap(() => this.userStore.getUser()),
				filter((user: User | undefined) => user?.name === this.activatedRoute.snapshot.paramMap.get('username'))
			)
			.subscribe({
				next: (user: User) => (this.user = user),
				error: (error: any) => console.error(error)
			});

		this.activatedRouteParamsCategoryId$?.unsubscribe();
		this.activatedRouteParamsCategoryId$ = this.activatedRoute.params
			.pipe(distinctUntilKeyChanged('categoryId'))
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
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		[
			this.activatedRouteParamsUsername$,
			this.activatedRouteParamsCategoryId$,
			this.activatedRouteQueryParams$,
			this.category$,
			this.postListRequest$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.category = this.skeletonService.getCategory();
		this.categorySkeletonToggle = true;

		this.postList = this.skeletonService.getPostList();
		this.postListSkeletonToggle = true;
		this.postListIsHasMore = false;
	}

	setResolver(): void {
		this.category$?.unsubscribe();
		this.category$ = this.userStore
			.getCategory()
			.pipe(filter((category: Category | undefined) => !!category))
			.subscribe({
				next: (category: Category) => {
					this.category = category;
					this.categorySkeletonToggle = false;
				},
				error: (error: any) => console.error(error)
			});

		this.activatedRouteQueryParams$?.unsubscribe();
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams.pipe(distinctUntilKeyChanged('query')).subscribe({
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

	/** Category */

	onCreateCategory(category: Category): void {
		const categoryList: Category[] = this.userStore.categoryList.getValue();

		this.userStore.setCategoryList([category].concat(categoryList));
		this.userStore.setCategory(category);

		// Navigate

		const navigationExtras: NavigationExtras = {
			relativeTo: this.activatedRoute.parent
		};

		this.router
			.navigate(['.', 'category', category.id], navigationExtras)
			.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
	}

	onUpdateCategory(categoryUpdate: Category): void {
		const categoryList: Category[] = this.userStore.categoryList
			.getValue()
			.map((category: Category) => (category.id === categoryUpdate.id ? categoryUpdate : category));

		this.userStore.setCategoryList(categoryList);
		this.userStore.setCategory(categoryUpdate);

		// Navigate

		const navigationExtras: NavigationExtras = {
			relativeTo: this.activatedRoute.parent
		};

		this.router
			.navigate(['.', 'category', categoryUpdate.id], navigationExtras)
			.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
	}

	onDeleteCategory(categoryDeleteDto: CategoryDeleteDto): void {
		const categoryList: Category[] = this.userStore.categoryList.getValue();

		// prettier-ignore
		this.userStore.setCategoryList(categoryList.filter((category: Category) => category.id !== categoryDeleteDto.categoryId));
		this.userStore.setCategory(categoryList.find((category: Category) => category.id === categoryDeleteDto.categoryId));

		// Navigate

		const navigationCommands: string[] = ['.'];
		const navigationExtras: NavigationExtras = {
			relativeTo: this.activatedRoute.parent
		};

		if (categoryDeleteDto.categoryId) {
			navigationCommands.push('category', String(categoryDeleteDto.categoryId));
		}

		this.router
			.navigate(navigationCommands, navigationExtras)
			.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
	}

	/** PostList */

	getPostList(postListLoadMore: boolean = false): void {
		this.postListIsLoading.set(true);

		/** Params */

		const username: string = String(this.activatedRoute.snapshot.paramMap.get('username') || '');
		const categoryId: number = Number(this.activatedRoute.snapshot.paramMap.get('categoryId'));

		/** Algolia */

		const postQuery: string = String(this.activatedRoute.snapshot.queryParamMap.get('query') || '');
		const postIndex: SearchIndex = this.algoliaService.getSearchIndex('post');
		const postIndexFilters: string[] = [];

		postIndexFilters.push('user.name:' + username);
		postIndexFilters.push('category.id:' + String(categoryId));

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
