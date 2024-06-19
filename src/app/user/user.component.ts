/** @format */

import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Params, Router, RouterModule } from '@angular/router';
import { distinctUntilChanged, distinctUntilKeyChanged, from, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { AvatarComponent } from '../standalone/components/avatar/avatar.component';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
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
import { SkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { CategoryUpdateComponent } from '../standalone/components/category/update/update.component';
import { CategoryDeleteComponent } from '../standalone/components/category/delete/delete.component';
import { CategoryCreateComponent } from '../standalone/components/category/create/create.component';
import { CategoryService } from '../core/services/category.service';
import { CategoryDeleteDto } from '../core/dto/category/category-delete.dto';
import { TitleService } from '../core/services/title.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { MetaService } from '../core/services/meta.service';
import { ReportService } from '../core/services/report.service';
import { SearchFormComponent } from '../standalone/components/search-form/search-form.component';
import { QrCodeComponent } from '../standalone/components/qr-code/qr-code.component';
import { UserUrlPipe } from '../standalone/pipes/user-url.pipe';
import { CopyToClipboardDirective } from '../standalone/directives/app-copy-to-clipboard.directive';
import { SnackbarService } from '../core/services/snackbar.service';
import { PlatformService } from '../core/services/platform.service';
import { UserGetOneDto } from '../core/dto/user/user-get-one.dto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	standalone: true,
	imports: [
		RouterModule,
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
		UserUrlPipe,
		CopyToClipboardDirective
	],
	selector: 'app-user',
	templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly router: Router = inject(Router);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly userService: UserService = inject(UserService);
	private readonly titleService: TitleService = inject(TitleService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly reportService: ReportService = inject(ReportService);
	private readonly categoryService: CategoryService = inject(CategoryService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly changeDetectorRef: ChangeDetectorRef = inject(ChangeDetectorRef);
	private readonly platformService: PlatformService = inject(PlatformService);

	activatedRouteUrl$: Subscription | undefined;
	activatedRouteFirstChildParams$: Subscription | undefined;

	user: User | undefined;
	userRequest$: Subscription | undefined;
	userTemp: User | undefined;
	userSkeletonToggle: boolean = true;
	userPostComponent: UserPostComponent | undefined;

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	searchFormToggle: boolean = false;

	category: Category | undefined;
	categoryRequest$: Subscription | undefined;
	categorySkeletonToggle: boolean = true;

	categoryList: Category[] = [];
	categoryListSkeletonToggle: boolean = true;

	platformServiceIsServerSkeletonToggle: boolean = true;

	ngOnInit(): void {
		this.activatedRouteUrl$?.unsubscribe();
		this.activatedRouteUrl$ = this.activatedRoute.url
			.pipe(
				switchMap(() => this.activatedRoute.params),
				distinctUntilChanged((previousParams: Params, currentParams: Params) => {
					const userName: boolean = previousParams.userName === currentParams.userName;
					const userId: boolean = previousParams.userId === currentParams.userId;

					return userName && userId;
				}),
				tap(() => {
					this.userRequest$?.unsubscribe();
					this.activatedRouteFirstChildParams$?.unsubscribe();
				})
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

		/** Mask Markdown initialization */

		this.platformServiceIsServerSkeletonToggle = this.platformService.isServer();
	}

	ngOnDestroy(): void {
		[
			this.activatedRouteUrl$,
			this.activatedRouteFirstChildParams$,
			this.userRequest$,
			this.categoryRequest$,
			this.currentUser$,
			this.currentUserSkeletonToggle$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.user = this.skeletonService.getUser(['categories']);
		this.userSkeletonToggle = true;

		this.categoryList = this.skeletonService.getCategoryList();
		this.categoryListSkeletonToggle = true;

		const categoryId: number = Number(this.activatedRoute.firstChild.snapshot.paramMap.get('categoryId'));

		if (categoryId) {
			this.category = this.skeletonService.getCategory();
			this.categorySkeletonToggle = true;
		}
	}

	setResolver(): void {
		this.userRequest$?.unsubscribe();
		this.userRequest$ = this.getUser().subscribe({
			next: (user: User) => {
				this.userService.userTemp.next(user);

				this.user = user;
				this.userSkeletonToggle = false;

				this.categoryList = this.user.categories;
				this.categoryListSkeletonToggle = false;

				// Set category

				this.activatedRouteFirstChildParams$?.unsubscribe();
				this.activatedRouteFirstChildParams$ = this.activatedRoute.firstChild.params
					.pipe(distinctUntilKeyChanged('categoryId'))
					.subscribe({
						next: () => {
							const setMeta = (): void => {
								const postId: number = Number(this.activatedRoute.firstChild.snapshot.paramMap.get('postId'));

								// Allow the post to record its tags

								if (!postId) {
									/** Apply SEO meta tags */

									this.setMetaTags();
									this.setTitle();
								}
							};

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
				const userName: string = this.userService.getUserUrl(this.user, 1);
				const userDescription: string = this.user.description || 'User has not yet added a profile description.';

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

	/** Redirect */

	getUser(): Observable<User | undefined> {
		const userId: number = Number(this.activatedRoute.snapshot.paramMap.get('userId'));
		const userName: string = String(this.activatedRoute.snapshot.paramMap.get('userName') || '');

		if (userId) {
			return this.getUserGetOne(userId);
		} else if (userName) {
			if (this.userTemp) {
				return of(this.userTemp).pipe(tap(() => (this.userTemp = undefined)));
			} else {
				return this.getUserGetAll(userName.substring(1));
			}
		} else {
			return of(undefined);
		}
	}

	getUserGetOne(userId: number): Observable<User> {
		const userGetOneDto: UserGetOneDto = {
			scope: ['categories']
		};

		return this.userService.getOne(userId, userGetOneDto).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router.navigate(['/error', 404]).then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			}),
			tap((user: User) => (this.userTemp = user)),
			switchMap((user: User) => {
				const commands: string[] = [this.userService.getUserUrl(user)];
				const extras: NavigationExtras = {
					replaceUrl: true
				};

				const categoryId: string = String(this.activatedRoute.snapshot.paramMap.get('categoryId') || '');

				if (categoryId) {
					commands.push('category');
					commands.push(categoryId);
				}

				return from(this.router.navigate(commands, extras)).pipe(switchMap(() => of(user)));
			})
		);
	}

	getUserGetAll(userName: string): Observable<User> {
		const userGetAllDto: UserGetAllDto = {
			userName: userName,
			scope: ['categories'],
			page: 1,
			size: 10
		};

		return this.userService.getAll(userGetAllDto).pipe(
			switchMap((userList: User[]) => (userList[0] ? of(userList[0]) : throwError(() => new Error()))),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router.navigate(['/error', 404]).then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
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
				.then(() => console.debug('Route changed'));
		}

		// ExpressionChangedAfterItHasBeenCheckedError (searchFormToggle)

		this.changeDetectorRef.detectChanges();
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

	/** Router outlet */

	onRouterOutlet(userPostComponent: UserPostComponent | undefined): void {
		this.userPostComponent = userPostComponent;

		// ExpressionChangedAfterItHasBeenCheckedError (userPostComponent)

		this.changeDetectorRef.detectChanges();
	}
}
