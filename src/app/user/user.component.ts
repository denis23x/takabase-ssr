/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, throwError } from 'rxjs';
import { catchError, debounceTime, filter } from 'rxjs/operators';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../standalone/components/avatar/avatar.component';
import { AppScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { WindowComponent } from '../standalone/components/window/window.component';
import { AppInputTrimWhitespaceDirective } from '../standalone/directives/app-input-trim-whitespace.directive';
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

interface PostSearchForm {
	query: FormControl<string>;
	orderBy: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		AvatarComponent,
		DayjsPipe,
		AppScrollPresetDirective,
		SvgIconComponent,
		WindowComponent,
		AppInputTrimWhitespaceDirective,
		MarkdownPipe,
		SanitizerPipe,
		DropdownComponent,
		AppSkeletonDirective,
		CategoryUpdateComponent,
		CategoryDeleteComponent
	],
	selector: 'app-user',
	templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
	activatedRouteUrl$: Subscription | undefined;
	activatedRouteQueryParams$: Subscription | undefined;
	activatedRouteFirstChildParams$: Subscription | undefined;

	user: User | undefined;
	userRequest$: Subscription | undefined;
	userPostComponent: UserPostComponent | undefined;
	userSkeletonToggle: boolean = true;

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	postSearchForm: FormGroup | undefined;
	postSearchForm$: Subscription | undefined;
	postSearchFormToggle: boolean = false;
	postSearchFormIsSubmitted$: Subscription | undefined;
	postSearchFormOrderByList: string[] = ['newest', 'oldest'];

	category: Category | undefined;
	categorySkeletonToggle: boolean = true;

	categoryList: Category[] = [];
	categoryListSkeletonToggle: boolean = true;

	constructor(
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private authorizationService: AuthorizationService,
		private userService: UserService,
		private skeletonService: SkeletonService,
		private snackbarService: SnackbarService
	) {
		this.postSearchForm = this.formBuilder.group<PostSearchForm>({
			query: this.formBuilder.nonNullable.control('', [
				Validators.minLength(2),
				Validators.maxLength(24)
			]),
			orderBy: this.formBuilder.nonNullable.control('', [])
		});
	}

	ngOnInit(): void {
		/** Apply Data */

		this.activatedRouteUrl$ = this.activatedRoute.url.subscribe({
			next: () => {
				this.setSkeleton();
				this.setResolver();
			},
			error: (error: any) => console.error(error)
		});

		/** Current User */

		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});

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
			this.activatedRouteQueryParams$,
			this.activatedRouteFirstChildParams$,
			this.userRequest$,
			this.currentUser$,
			this.currentUserSkeletonToggle$,
			this.postSearchForm$,
			this.postSearchFormIsSubmitted$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.user = this.skeletonService.getUser(['categories']);
		this.userSkeletonToggle = true;
		this.userPostComponent?.userComponent$.next(this.user);

		// prettier-ignore
		const categoryId: number = Number(this.activatedRoute.firstChild.snapshot.paramMap.get('categoryId') || '');

		if (categoryId) {
			this.category = this.skeletonService.getCategory();
			this.categorySkeletonToggle = true;
		}

		this.categoryList = this.skeletonService.getCategoryList();
		this.categoryListSkeletonToggle = true;
	}

	setResolver(): void {
		this.userRequest$?.unsubscribe();
		this.activatedRouteFirstChildParams$?.unsubscribe();

		const name: string = String(this.activatedRoute.snapshot.paramMap.get('name') || '');

		const userGetAllDto: UserGetAllDto = {
			name: name.substring(1),
			scope: ['categories']
		};

		this.userRequest$ = this.userService.getAll(userGetAllDto).subscribe({
			next: (userList: User[]) => {
				this.user = userList.shift();
				this.userSkeletonToggle = false;
				this.userPostComponent.userComponent$.next(this.user);

				this.categoryList = this.user.categories;
				this.categoryListSkeletonToggle = false;

				// Set category

				this.activatedRouteFirstChildParams$ = this.activatedRoute.firstChild.params.subscribe({
					next: () => {
						// prettier-ignore
						const categoryId: number = Number(this.activatedRoute.firstChild.snapshot.paramMap.get('categoryId') || '');

						this.category = this.categoryList.find((category: Category) => {
							return category.id === categoryId;
						});

						this.categorySkeletonToggle = false;
					},
					error: (error: any) => console.error(error)
				});
			},
			error: (error: any) => console.error(error)
		});
	}

	onTogglePostSearchForm(): void {
		if (this.postSearchFormToggle) {
			this.router
				.navigate([], {
					relativeTo: this.activatedRoute,
					queryParams: {
						query: null,
						orderBy: null
					},
					queryParamsHandling: 'merge'
				})
				.then(() => console.debug('Route changed'));

			this.postSearchForm.reset();
			this.postSearchFormToggle = false;

			this.postSearchForm$?.unsubscribe();
			this.activatedRouteQueryParams$?.unsubscribe();
		} else {
			this.postSearchFormToggle = true;

			// Set postSearchForm to queryParams

			this.postSearchForm$ = this.postSearchForm.valueChanges
				.pipe(
					debounceTime(1000),
					filter(() => this.postSearchForm.valid)
				)
				.subscribe({
					next: () => {
						this.router
							.navigate([], {
								relativeTo: this.activatedRoute,
								queryParams: {
									query: this.postSearchForm.value.query || null,
									orderBy: this.postSearchForm.value.orderBy || null
								},
								queryParamsHandling: 'merge'
							})
							.then(() => console.debug('Route changed'));
					},
					error: (error: any) => console.error(error)
				});

			// Set queryParams to postSearchForm

			this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
				.pipe(filter((params: Params) => params.query || params.orderBy))
				.subscribe({
					next: (params: Params) => {
						this.postSearchForm.patchValue(params, { emitEvent: false });
						this.postSearchForm.markAllAsTouched();
						this.postSearchFormToggle = true;
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	onRouterOutletActivate(userPostComponent: UserPostComponent): void {
		this.userPostComponent = userPostComponent;

		const isLoading$: Observable<boolean> = this.userPostComponent.abstractListIsLoading$;

		// prettier-ignore
		this.postSearchFormIsSubmitted$ = isLoading$.subscribe({
			next: (isSubmitted: boolean) => isSubmitted ? this.postSearchForm.disable() : this.postSearchForm.enable(),
			error: (error: any) => console.error(error)
		});
	}

	onLogout(): void {
		this.authorizationService
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
