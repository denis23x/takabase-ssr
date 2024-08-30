/** @format */

import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { distinctUntilKeyChanged, from, Subscription, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AvatarComponent } from '../standalone/components/avatar/avatar.component';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { DayjsPipe } from '../standalone/pipes/dayjs.pipe';
import { UserService } from '../core/services/user.service';
import { DropdownComponent } from '../standalone/components/dropdown/dropdown.component';
import { SkeletonService } from '../core/services/skeleton.service';
import { SkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { TitleService } from '../core/services/title.service';
import { MetaService } from '../core/services/meta.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../core/services/platform.service';
import { ApiService } from '../core/services/api.service';
import { CategoryService } from '../core/services/category.service';
import { UserStore } from './user.store';
import { HelperService } from '../core/services/helper.service';
import { CurrentUserMixin as CU } from '../core/mixins/current-user.mixin';
import type { User } from '../core/models/user.model';
import type { Category } from '../core/models/category.model';
import type { UserGetAllDto } from '../core/dto/user/user-get-all.dto';
import type { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import type { CategoryGetAllDto } from '../core/dto/category/category-get-all.dto';

@Component({
	standalone: true,
	imports: [
		RouterModule,
		CommonModule,
		AvatarComponent,
		DayjsPipe,
		ScrollPresetDirective,
		SvgIconComponent,
		DropdownComponent,
		SkeletonDirective
	],
	providers: [CategoryService, UserService, UserStore],
	selector: 'app-user',
	templateUrl: './user.component.html'
})
export class UserComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly userService: UserService = inject(UserService);
	private readonly titleService: TitleService = inject(TitleService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly router: Router = inject(Router);
	private readonly apiService: ApiService = inject(ApiService);
	private readonly categoryService: CategoryService = inject(CategoryService);
	private readonly userStore: UserStore = inject(UserStore);
	private readonly helperService: HelperService = inject(HelperService);

	@ViewChild('routerLinkActiveBookmark') routerLinkActiveBookmark: RouterLinkActive | undefined;
	@ViewChild('routerLinkActivePassword') routerLinkActivePassword: RouterLinkActive | undefined;
	@ViewChild('routerLinkActivePrivate') routerLinkActivePrivate: RouterLinkActive | undefined;

	activatedRouteParamsUsername$: Subscription | undefined;
	activatedRouteParamsCategoryId$: Subscription | undefined;

	user: User | undefined;
	userRequest$: Subscription | undefined;
	userSkeletonToggle: boolean = true;

	category: Category | undefined;
	categorySkeletonToggle: boolean = true;

	categoryList: Category[] = [];
	categoryListRequest$: Subscription | undefined;
	categoryListSkeletonToggle: boolean = true;

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
		[this.activatedRouteParamsUsername$, this.activatedRouteParamsCategoryId$, this.userRequest$, this.categoryListRequest$].forEach(($: Subscription) => $?.unsubscribe());

		// Reset store

		this.userStore.reset();
	}

	setSkeleton(): void {
		this.user = this.skeletonService.getUser();
		this.userSkeletonToggle = true;

		this.categoryList = this.skeletonService.getCategoryList();
		this.categoryListSkeletonToggle = true;
	}

	setResolver(): void {
		/** Get and set user */

		const username: string = String(this.activatedRoute.snapshot.paramMap.get('username') || '');
		const userGetAllDto: UserGetAllDto = {
			username,
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

					return from(this.router.navigate(['/error', httpErrorResponse.status], { skipLocationChange: true })).pipe(
						switchMap(() => throwError(() => httpErrorResponse))
					);
				}),
				tap((user: User) => this.userStore.setUser(user))
			)
			.subscribe({
				next: (user: User) => {
					this.user = user;
					this.userSkeletonToggle = false;

					/** Apply SEO meta tags */

					this.setTitle();
					this.setMetaTags();
				},
				error: (error: any) => console.error(error)
			});

		/** Get and set categoryList */

		const categoryGetAllDto: CategoryGetAllDto = {
			username,
			page: 1,
			size: 50
		};

		this.categoryListRequest$?.unsubscribe();
		this.categoryListRequest$ = this.categoryService
			.getAll(categoryGetAllDto)
			.pipe(
				tap((categoryList: Category[]) => this.userStore.setCategoryList(categoryList)),
				switchMap(() => this.userStore.getCategoryList())
			)
			.subscribe({
				next: (categoryList: Category[]) => {
					this.categoryList = categoryList;
					this.categoryListSkeletonToggle = false;

					/** Set and get category */

					this.activatedRouteParamsCategoryId$?.unsubscribe();
					this.activatedRouteParamsCategoryId$ = this.activatedRoute.params
						.pipe(
							distinctUntilKeyChanged('categoryId'),
							map((params: Params) => Number(params.categoryId)),
							map((categoryId: number) => this.categoryList.find((category: Category) => category.id === categoryId)),
							tap((category: Category | undefined) => this.userStore.setCategory(category))
						)
						.subscribe({
							next: (category: Category | undefined) => {
								this.category = category;
								this.categorySkeletonToggle = false;

								if (!category) {
									const isHasCategoryId: boolean = !!Number(this.activatedRoute.snapshot.paramMap.get('categoryId'));
									const isSkeletonDisabled: boolean = this.categoryListSkeletonToggle === false;

									if (isHasCategoryId && isSkeletonDisabled) {
										const httpErrorResponse: HttpErrorResponse = new HttpErrorResponse({
											status: 404
										});

										/** Set Transfer State */

										if (this.platformService.isServer()) {
											this.apiService.setHttpErrorResponseKey(httpErrorResponse);
										}

										/** Redirect */

										// prettier-ignore
										this.router
											.navigate(['/error', httpErrorResponse.status], { skipLocationChange: true })
											.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
									}
								} else {
									/** Apply SEO meta tags */

									this.setTitle();
									this.setMetaTags();
								}
							},
							error: (error: any) => console.error(error)
						});
				},
				error: (error: any) => console.error(error)
			});
	}

	setTitle(): void {
		if (this.category) {
			this.titleService.setTitle(this.category.name);
		} else {
			this.titleService.setTitle(this.user.name);
		}
	}

	setMetaTags(): void {
		const metaOpenGraph: Partial<MetaOpenGraph> = {
			['og:image']: this.helperService.getImageURLQueryParams(this.user.avatar),
			['og:image:alt']: this.user.name,
			['og:image:type']: 'image/webp'
		};

		const metaTwitter: Partial<MetaTwitter> = {
			['twitter:image']: this.helperService.getImageURLQueryParams(this.user.avatar),
			['twitter:image:alt']: this.user.name
		};

		if (this.category) {
			const title: string = this.category.name;
			const description: string = this.category.description || 'Category has not yet a description';

			metaOpenGraph['og:title'] = title;
			metaOpenGraph['og:description'] = description;
			metaOpenGraph['og:type'] = 'profile';

			metaTwitter['twitter:title'] = title;
			metaTwitter['twitter:description'] = description;
		} else {
			const title: string = this.user.name;
			const description: string = this.user.description || 'User has not yet added a profile description';

			metaOpenGraph['og:title'] = title;
			metaOpenGraph['og:description'] = description;
			metaOpenGraph['og:type'] = 'website';

			metaTwitter['twitter:title'] = title;
			metaTwitter['twitter:description'] = description;
		}

		this.metaService.setMeta(metaOpenGraph as MetaOpenGraph, metaTwitter as MetaTwitter);
	}
}
