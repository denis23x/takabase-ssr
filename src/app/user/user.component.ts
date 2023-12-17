/** @format */

import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { distinctUntilKeyChanged, Subscription, throwError } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../standalone/components/avatar/avatar.component';
import { AppScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { DayjsPipe } from '../standalone/pipes/dayjs.pipe';
import { User } from '../core/models/user.model';
import { Category } from '../core/models/category.model';
import { AuthorizationService } from '../core/services/authorization.service';
import { UserService } from '../core/services/user.service';
import { MarkdownPipe } from '../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../standalone/pipes/sanitizer.pipe';
import { DropdownComponent } from '../standalone/components/dropdown/dropdown.component';
import { CurrentUser } from '../core/models/current-user.model';
import { UserPostComponent } from './post/post.component';
import { SkeletonService } from '../core/services/skeleton.service';
import { UserGetAllDto } from '../core/dto/user/user-get-all.dto';
import { AppSkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { CategoryUpdateComponent } from '../standalone/components/category/update/update.component';
import { CategoryDeleteComponent } from '../standalone/components/category/delete/delete.component';
import { HttpErrorResponse } from '@angular/common/http';
import { SnackbarService } from '../core/services/snackbar.service';
import { CategoryCreateComponent } from '../standalone/components/category/create/create.component';
import { CategoryService } from '../core/services/category.service';
import { CategoryDeleteDto } from '../core/dto/category/category-delete.dto';
import { TitleService } from '../core/services/title.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { MetaService } from '../core/services/meta.service';
import { ReportService } from '../core/services/report.service';
import { SearchFormComponent } from '../standalone/components/search-form/search-form.component';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		AvatarComponent,
		DayjsPipe,
		AppScrollPresetDirective,
		SvgIconComponent,
		MarkdownPipe,
		SanitizerPipe,
		DropdownComponent,
		AppSkeletonDirective,
		CategoryUpdateComponent,
		CategoryDeleteComponent,
		CategoryCreateComponent,
		SearchFormComponent
	],
	selector: 'app-user',
	templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
	activatedRouteUrl$: Subscription | undefined;
	activatedRouteFirstChildParams$: Subscription | undefined;

	user: User | undefined;
	userRequest$: Subscription | undefined;
	userPostComponent: UserPostComponent | undefined;
	userSkeletonToggle: boolean = true;

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;
	currentUserLogoutRequest$: Subscription | undefined;

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	searchFormToggle: boolean = false;

	category: Category | undefined;
	categoryRequest$: Subscription | undefined;
	categorySkeletonToggle: boolean = true;

	categoryList: Category[] = [];
	categoryListSkeletonToggle: boolean = true;

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private authorizationService: AuthorizationService,
		private userService: UserService,
		private titleService: TitleService,
		private metaService: MetaService,
		private reportService: ReportService,
		private categoryService: CategoryService,
		private skeletonService: SkeletonService,
		private snackbarService: SnackbarService,
		private changeDetectorRef: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.activatedRouteUrl$?.unsubscribe();
		this.activatedRouteUrl$ = this.activatedRoute.url
			.pipe(
				switchMap(() => this.activatedRoute.params),
				distinctUntilKeyChanged('userName')
			)
			.subscribe({
				next: () => {
					/** Apply Data */

					this.setSkeleton();
					this.setResolver();
				},
				error: (error: any) => console.error(error)
			});

		/** Current User */

		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});

		this.currentUserSkeletonToggle$?.unsubscribe();
		this.currentUserSkeletonToggle$ = this.authorizationService.currentUserIsPopulated
			.pipe(filter((currentUserIsPopulated: boolean) => currentUserIsPopulated))
			.subscribe({
				next: () => (this.currentUserSkeletonToggle = false),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[
			this.activatedRouteUrl$,
			this.activatedRouteFirstChildParams$,
			this.userRequest$,
			this.categoryRequest$,
			this.currentUser$,
			this.currentUserLogoutRequest$,
			this.currentUserSkeletonToggle$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.user = this.skeletonService.getUser(['categories']);
		this.userSkeletonToggle = true;

		this.categoryList = this.skeletonService.getCategoryList();
		this.categoryListSkeletonToggle = true;

		// prettier-ignore
		const categoryId: number = Number(this.activatedRoute.firstChild.snapshot.paramMap.get('categoryId'));

		if (categoryId) {
			this.category = this.skeletonService.getCategory();
			this.categorySkeletonToggle = true;
		}
	}

	setResolver(): void {
		// prettier-ignore
		const userName: string = String(this.activatedRoute.snapshot.paramMap.get('userName') || '');

		const userGetAllDto: UserGetAllDto = {
			name: userName.substring(1),
			scope: ['categories']
		};

		this.userRequest$?.unsubscribe();
		this.userRequest$ = this.userService.getAll(userGetAllDto).subscribe({
			next: (userList: User[]) => {
				if (!userList.length) {
					this.router.navigate(['error', 404]).then(() => console.debug('Route changed'));
				} else {
					this.user = userList[0];
					this.userSkeletonToggle = false;

					this.categoryList = this.user.categories;
					this.categoryListSkeletonToggle = false;

					// Set category

					this.activatedRouteFirstChildParams$?.unsubscribe();
					this.activatedRouteFirstChildParams$ = this.activatedRoute.firstChild.params
						.pipe(
							switchMap(() => this.activatedRoute.firstChild.params),
							distinctUntilKeyChanged('categoryId')
						)
						.subscribe({
							next: () => {
								// Apply SEO meta tags && title

								// prettier-ignore
								const setMeta = (): void => {
									const postId: number = Number(this.activatedRoute.firstChild.snapshot.paramMap.get('postId'));

                  // Allow the post to record its tags

									if (!postId) {
										this.setMetaTags();
										this.setTitle();
									}
								};

								// prettier-ignore
								const categoryId: number = Number(this.activatedRoute.firstChild.snapshot.paramMap.get('categoryId'));

								if (categoryId) {
									this.category = this.skeletonService.getCategory();
									this.categorySkeletonToggle = true;

									this.categoryRequest$?.unsubscribe();
									this.categoryRequest$ = this.categoryService.getOne(categoryId).subscribe({
										next: (category: Category) => {
											this.category = category;
											this.categorySkeletonToggle = false;

											setMeta();
										},
										error: (error: any) => console.error(error)
									});
								} else {
									this.category = undefined;
									this.categorySkeletonToggle = false;

									setMeta();
								}
							},
							error: (error: any) => console.error(error)
						});
				}
			},
			error: (error: any) => console.error(error)
		});

		/** Toggle SearchForm component */

		if (this.activatedRoute.snapshot.queryParamMap.get('query')) {
			this.onToggleSearchForm();
		}
	}

	setTitle(): void {
		this.titleService.setTitle(this.user.name);

		if (this.category) {
			this.titleService.appendTitle(this.category.name);
		}
	}

	setMetaTags(): void {
		const userName: string = this.userService.getUserUrl(this.user, 1);
		const title: string = this.category?.name || userName;
		const description: string = this.category?.description || this.user.description;

		const metaOpenGraph: Partial<MetaOpenGraph> = {
			['og:title']: title,
			['og:description']: description,
			['og:image']: this.user.avatar,
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
			['twitter:image']: this.user.avatar,
			['twitter:image:alt']: userName
		};

		this.metaService.setMeta(metaOpenGraph as MetaOpenGraph, metaTwitter);
	}

	/** Search */

	onToggleSearchForm(): void {
		if (this.searchFormToggle) {
			this.searchFormToggle = false;

			this.router
				.navigate([], {
					relativeTo: this.activatedRoute,
					queryParams: null
				})
				.then(() => console.debug('Route changed'));
		} else {
			this.searchFormToggle = true;
		}
	}

	/** Report */

	onToggleReportDialog(toggle: boolean): void {
		this.reportService.reportDialogToggle$.next(toggle);
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
			.then(() => console.debug('Route changed'));
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
			.then(() => console.debug('Route changed'));
	}

	/** Misc */

	onRouterOutletActivate(userPostComponent: UserPostComponent): void {
		this.userPostComponent = userPostComponent;

		// ExpressionChangedAfterItHasBeenCheckedError (userPostComponent)

		this.changeDetectorRef.detectChanges();
	}

	onLogout(): void {
		this.currentUserLogoutRequest$?.unsubscribe();
		this.currentUserLogoutRequest$ = this.authorizationService
			.onLogout()
			.pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					this.router
						.navigate(['/error', httpErrorResponse.status])
						.then(() => console.debug('Route changed'));

					return throwError(() => httpErrorResponse);
				})
			)
			.subscribe({
				next: () => {
					this.router.navigateByUrl('/').then(() => {
						this.snackbarService.success(null, 'Bye bye');
					});
				},
				error: (error: any) => console.error(error)
			});
	}
}
