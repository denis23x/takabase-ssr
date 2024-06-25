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
import { distinctUntilKeyChanged, from, Subscription, throwError } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { AvatarComponent } from '../standalone/components/avatar/avatar.component';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { DayjsPipe } from '../standalone/pipes/dayjs.pipe';
import { User } from '../core/models/user.model';
import { Category } from '../core/models/category.model';
import { UserService } from '../core/services/user.service';
import { MarkdownPipe } from '../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../standalone/pipes/sanitizer.pipe';
import { DropdownComponent } from '../standalone/components/dropdown/dropdown.component';
import { CurrentUser } from '../core/models/current-user.model';
import { SkeletonService } from '../core/services/skeleton.service';
import { UserGetAllDto } from '../core/dto/user/user-get-all.dto';
import { SkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { CategoryUpdateComponent } from '../standalone/components/category/update/update.component';
import { CategoryDeleteComponent } from '../standalone/components/category/delete/delete.component';
import { CategoryCreateComponent } from '../standalone/components/category/create/create.component';
import { CategoryDeleteDto } from '../core/dto/category/category-delete.dto';
import { TitleService } from '../core/services/title.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { MetaService } from '../core/services/meta.service';
import { ReportService } from '../core/services/report.service';
import { SearchFormComponent } from '../standalone/components/search-form/search-form.component';
import { QrCodeComponent } from '../standalone/components/qr-code/qr-code.component';
import { CopyToClipboardDirective } from '../standalone/directives/app-copy-to-clipboard.directive';
import { SnackbarService } from '../core/services/snackbar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AsyncPipe, CommonModule } from '@angular/common';
import { CardPostComponent } from '../standalone/components/card/post/post.component';
import { Post } from '../core/models/post.model';
import { SearchIndex } from 'algoliasearch/lite';
import { SearchOptions, SearchResponse } from '@algolia/client-search';
import { PlatformService } from '../core/services/platform.service';
import { AlgoliaService } from '../core/services/algolia.service';
import { AuthorizationService } from '../core/services/authorization.service';
import { CookiesService } from '../core/services/cookies.service';
import { AppearanceService } from '../core/services/appearance.service';
import { PostGetAllDto } from '../core/dto/post/post-get-all.dto';
import { HelperService } from '../core/services/helper.service';
import { ApiService } from '../core/services/api.service';

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
		QrCodeComponent,
		CopyToClipboardDirective,
		AsyncPipe,
		CardPostComponent
	],
	selector: 'app-user',
	templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
	private readonly userService: UserService = inject(UserService);
	private readonly titleService: TitleService = inject(TitleService);
	private readonly reportService: ReportService = inject(ReportService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly transferState: TransferState = inject(TransferState);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly algoliaService: AlgoliaService = inject(AlgoliaService);
	private readonly cookiesService: CookiesService = inject(CookiesService);
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly router: Router = inject(Router);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly apiService: ApiService = inject(ApiService);

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

	activatedRouteParamsUserName$: Subscription | undefined;
	activatedRouteParamsCategoryId$: Subscription | undefined;
	activatedRouteQueryParams$: Subscription | undefined;

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	user: User | undefined;
	userRequest$: Subscription | undefined;
	userSkeletonToggle: boolean = true;

	searchFormToggle: boolean = false;

	category: Category | undefined;
	categoryRequest$: Subscription | undefined;
	categorySkeletonToggle: boolean = true;

	categoryList: Category[] = [];
	categoryListSkeletonToggle: boolean = true;

	postList: Post[] = [];
	postListRequest$: Subscription | undefined;
	postListSkeletonToggle: boolean = true;
	postListIsHasMore: boolean = false;
	postListIsLoading: WritableSignal<boolean> = signal(false);
	postListPageScrollInfinite: boolean = false;
	postListPageScrollInfinite$: Subscription | undefined;
	postListGetAllDto: PostGetAllDto = {
		page: 0,
		size: 20
	};

	ngOnInit(): void {
		this.activatedRouteParamsUserName$?.unsubscribe();
		this.activatedRouteParamsUserName$ = this.activatedRoute.params
			.pipe(distinctUntilKeyChanged('userName'))
			.subscribe({
				next: () => {
					/** Apply Data */

					this.setSkeleton();
					this.setResolver();
				},
				error: (error: any) => console.error(error)
			});

		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser | undefined) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});

		this.currentUserSkeletonToggle$?.unsubscribe();
		this.currentUserSkeletonToggle$ = this.authorizationService.currentUserIsPopulated
			.pipe(filter((currentUserIsPopulated: boolean) => currentUserIsPopulated))
			.subscribe({
				next: () => (this.currentUserSkeletonToggle = false),
				error: (error: any) => console.error(error)
			});

		/** Apply appearance settings */

		this.setAppearance();
	}

	ngOnDestroy(): void {
		[
			this.activatedRouteParamsUserName$,
			this.activatedRouteParamsCategoryId$,
			this.activatedRouteQueryParams$,
			this.currentUser$,
			this.currentUserSkeletonToggle$,
			this.userRequest$,
			this.categoryRequest$,
			this.postListRequest$,
			this.postListPageScrollInfinite$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.user = this.skeletonService.getUser(['categories']);
		this.userSkeletonToggle = true;

		this.categoryList = this.skeletonService.getCategoryList();
		this.categoryListSkeletonToggle = true;

		this.category = this.skeletonService.getCategory();
		this.categorySkeletonToggle = true;

		this.postList = this.skeletonService.getPostList();
		this.postListSkeletonToggle = true;
		this.postListIsHasMore = false;
	}

	setResolver(): void {
		const userName: string = String(this.activatedRoute.snapshot.paramMap.get('userName') || '');
		const userGetAllDto: UserGetAllDto = {
			userName,
			scope: ['categories'],
			page: 1,
			size: 10
		};

		this.userRequest$?.unsubscribe();
		this.userRequest$ = this.userService
			.getAll(userGetAllDto)
			.pipe(
				map((userList: User[]) => {
					if (userList[0]) {
						return userList[0];
					}

					throw new HttpErrorResponse({
						status: 404,
						statusText: 'Not Found'
					});
				}),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					/** Set Transfer State */

					if (this.platformService.isServer()) {
						this.apiService.setHttpErrorResponseKey(httpErrorResponse);
					}

					/** Redirect */

					return from(this.router.navigate(['/error', httpErrorResponse.status])).pipe(
						switchMap(() => throwError(() => httpErrorResponse))
					);
				})
			)
			.subscribe({
				next: (user: User) => {
					this.user = user;
					this.userSkeletonToggle = false;

					this.categoryList = this.user.categories;
					this.categoryListSkeletonToggle = false;

					this.activatedRouteParamsCategoryId$?.unsubscribe();
					this.activatedRouteParamsCategoryId$ = this.activatedRoute.params
						.pipe(
							distinctUntilKeyChanged('categoryId'),
							filter(() => userName === this.user.name)
						)
						.subscribe({
							next: () => {
								/** Set Category */

								const categoryId: number = Number(this.activatedRoute.snapshot.paramMap.get('categoryId'));

								if (categoryId) {
									this.category = this.user.categories.find((category: Category) => category.id === categoryId);
									this.categorySkeletonToggle = false;
								} else {
									this.category = undefined;
									this.categorySkeletonToggle = false;
								}

								/** Apply SEO meta tags */

								this.setMetaTags();
								this.setTitle();

								/** Set PostList */

								this.activatedRouteQueryParams$?.unsubscribe();
								this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
									.pipe(distinctUntilKeyChanged('query'))
									.subscribe({
										next: () => {
											this.postList = this.skeletonService.getPostList();
											this.postListSkeletonToggle = true;
											this.postListIsHasMore = false;

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
							},
							error: (error: any) => console.error(error)
						});
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

	setTitle(): void {
		this.titleService.setTitle(this.user.name);

		if (this.category) {
			this.titleService.setTitle(this.category.name);
		}
	}

	setMetaTags(): void {
		this.metaService.getMetaImageDownloadURL(this.user.avatar).subscribe({
			next: (downloadURL: string | null) => {
				const userName: string = this.user.name;
				const userDescription: string = this.user.description || 'User has not yet added a profile description';

				const title: string = this.category?.name || userName;
				const description: string = this.category?.description || userDescription;

				/** Set meta (SSR SEO trick) */

				const metaOpenGraph: Partial<MetaOpenGraph> = {
					['og:title']: title,
					['og:description']: description,
					['og:image']: downloadURL,
					['og:image:alt']: userName,
					['og:image:type']: 'image/png'
				};

				if (this.category) {
					metaOpenGraph['og:type'] = 'website';
				} else {
					metaOpenGraph['og:type'] = 'profile';
					metaOpenGraph['profile:username'] = userName;
				}

				const metaTwitter: MetaTwitter = {
					['twitter:title']: title,
					['twitter:description']: description,
					['twitter:image']: downloadURL,
					['twitter:image:alt']: userName
				};

				this.metaService.setMeta(metaOpenGraph as MetaOpenGraph, metaTwitter);
			},
			error: (error: any) => console.error(error)
		});
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
			this.searchFormToggle = true;
		} else {
			this.searchFormToggle = false;

			this.router
				.navigate([], {
					relativeTo: this.activatedRoute,
					queryParams: null,
					replaceUrl: true
				})
				.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
		}
	}

	/** Report */

	onToggleReportDialog(toggle: boolean): void {
		if (this.currentUser) {
			this.reportService.reportSubject$.next({ user: this.user });
			this.reportService.reportDialogToggle$.next(toggle);
		} else {
			this.snackbarService.warning('Nope', 'Log in before reporting');
		}
	}

	/** Category */

	onCreateCategory(categoryCreate: Category): void {
		this.categoryList.unshift(categoryCreate);

		this.category = categoryCreate;

		this.router
			.navigate(['./category', this.category.id], {
				queryParamsHandling: 'merge',
				relativeTo: this.activatedRoute
			})
			.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
	}

	onUpdateCategory(categoryUpdate: Category): void {
		this.categoryList = this.categoryList.map((category: Category) => {
			return category.id === categoryUpdate.id ? categoryUpdate : category;
		});

		this.category = categoryUpdate;
	}

	onDeleteCategory(categoryDelete: Category & CategoryDeleteDto): void {
		this.categoryList = this.categoryList.filter((category: Category) => {
			return category.id !== categoryDelete.id;
		});

		this.category = undefined;

		// Redirect

		const categoryDeleteRedirect: string[] = ['.'];

		if (categoryDelete.categoryId) {
			categoryDeleteRedirect.push('category', String(categoryDelete.categoryId));
		}

		this.router
			.navigate(categoryDeleteRedirect, {
				queryParamsHandling: 'merge',
				relativeTo: this.activatedRoute
			})
			.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
	}

	/** PostList */

	getPostList(postListLoadMore: boolean = false): void {
		this.postListIsLoading.set(true);

		/** Algolia */

		const postQuery: string = String(this.activatedRoute.snapshot.queryParamMap.get('query') || '');
		const postIndex: SearchIndex = this.algoliaService.getSearchIndex('post');
		const postIndexFilters: string[] = [];

		const userName: string = String(this.activatedRoute.snapshot.paramMap.get('userName') || '');
		const categoryId: string = String(this.activatedRoute.snapshot.paramMap.get('categoryId') || '');

		if (userName) {
			postIndexFilters.push('user.name:' + userName);
		}

		if (categoryId) {
			postIndexFilters.push('category.id:' + categoryId);
		}

		const postIndexSearch: SearchOptions = {
			page: (() => (postListLoadMore ? this.postListGetAllDto.page++ : (this.postListGetAllDto.page = 0)))(),
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

		this.postList = this.postListGetAllDto.page > 1 ? this.postList.concat(postList) : postList;
		this.postListSkeletonToggle = false;
		this.postListIsHasMore = postListIsHasMore && searchResponse.nbPages > 1;
		this.postListIsLoading.set(false);
	}
}
