/** @format */

import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterModule } from '@angular/router';
import { distinctUntilKeyChanged, from, Subscription, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
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
import { SkeletonService } from '../core/services/skeleton.service';
import { UserGetAllDto } from '../core/dto/user/user-get-all.dto';
import { SkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { TitleService } from '../core/services/title.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { MetaService } from '../core/services/meta.service';
import { ReportService } from '../core/services/report.service';
import { QrCodeComponent } from '../standalone/components/qr-code/qr-code.component';
import { CopyToClipboardDirective } from '../standalone/directives/app-copy-to-clipboard.directive';
import { SnackbarService } from '../core/services/snackbar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../core/services/platform.service';
import { ApiService } from '../core/services/api.service';
import { CategoryService } from '../core/services/category.service';
import { CategoryGetAllDto } from '../core/dto/category/category-get-all.dto';
import { UserStore } from './user.store';
import { CurrentUserMixin as CU } from '../core/mixins/current-user.mixin';

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
		QrCodeComponent,
		CopyToClipboardDirective
	],
	selector: 'app-user',
	templateUrl: './user.component.html'
})
export class UserComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly userService: UserService = inject(UserService);
	private readonly titleService: TitleService = inject(TitleService);
	private readonly reportService: ReportService = inject(ReportService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly router: Router = inject(Router);
	private readonly apiService: ApiService = inject(ApiService);
	private readonly categoryService: CategoryService = inject(CategoryService);
	private readonly userStore: UserStore = inject(UserStore);

	@ViewChild('routerLinkActivePassword') routerLinkActivePassword: RouterLinkActive | undefined;
	@ViewChild('routerLinkActivePrivate') routerLinkActivePrivate: RouterLinkActive | undefined;

	@ViewChild('appQrCodeComponent') appQrCodeComponent: QrCodeComponent | undefined;

	activatedRouteParamsUsername$: Subscription | undefined;
	activatedRouteParamsCategoryId$: Subscription | undefined;
	activatedRouteParamsCategoryId: number;

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

		[
			this.activatedRouteParamsUsername$,
			this.activatedRouteParamsCategoryId$,
			this.userRequest$,
			this.categoryListRequest$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.user = this.skeletonService.getUser();
		this.userSkeletonToggle = true;

		this.categoryList = this.skeletonService.getCategoryList();
		this.categoryListSkeletonToggle = true;
	}

	setResolver(): void {
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

					return from(this.router.navigate(['/error', httpErrorResponse.status])).pipe(
						switchMap(() => throwError(() => httpErrorResponse))
					);
				}),
				tap((user: User) => this.userStore.setUser(user))
			)
			.subscribe({
				next: (user: User) => {
					this.user = user;
					this.userSkeletonToggle = false;

					/** Set CategoryList */

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

								/** Set Category */

								this.activatedRouteParamsCategoryId$?.unsubscribe();
								this.activatedRouteParamsCategoryId$ = this.activatedRoute.params
									.pipe(
										distinctUntilKeyChanged('categoryId'),
										map(() => Number(this.activatedRoute.snapshot.paramMap.get('categoryId'))),
										tap((categoryId: number) => (this.activatedRouteParamsCategoryId = categoryId)),
										map((categoryId: number) => categoryList.find((category: Category) => category.id === categoryId)),
										tap((category: Category | undefined) => this.userStore.setCategory(category))
									)
									.subscribe({
										next: (category: Category | undefined) => {
											this.category = category;
											this.categorySkeletonToggle = false;

											/** Apply SEO meta tags */

											this.setMetaTags();
											this.setTitle();
										},
										error: (error: any) => console.error(error)
									});
							},
							error: (error: any) => console.error(error)
						});
				},
				error: (error: any) => console.error(error)
			});
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
				const username: string = this.user.name;
				const userDescription: string = this.user.description || 'User has not yet added a profile description';

				const title: string = this.category?.name || username;
				const description: string = this.category?.description || userDescription;

				const metaOpenGraph: Partial<MetaOpenGraph> = {
					['og:title']: title,
					['og:description']: description,
					['og:image']: downloadURL,
					['og:image:alt']: username,
					['og:image:type']: 'image/png'
				};

				if (this.category) {
					metaOpenGraph['og:type'] = 'website';
				} else {
					metaOpenGraph['og:type'] = 'profile';
					metaOpenGraph['profile:username'] = username;
				}

				const metaTwitter: MetaTwitter = {
					['twitter:title']: title,
					['twitter:description']: description,
					['twitter:image']: downloadURL,
					['twitter:image:alt']: username
				};

				this.metaService.setMeta(metaOpenGraph as MetaOpenGraph, metaTwitter);
			},
			error: (error: any) => console.error(error)
		});
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
}
