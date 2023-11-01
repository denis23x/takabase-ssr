/** @format */

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, filter, first, startWith } from 'rxjs/operators';
import {
	AbstractControl,
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
import { Post } from '../core/models/post.model';
import { Category } from '../core/models/category.model';
import { HelperService } from '../core/services/helper.service';
import { AuthorizationService } from '../core/services/authorization.service';
import { CategoryService } from '../core/services/category.service';
import { SnackbarService } from '../core/services/snackbar.service';
import { UserService } from '../core/services/user.service';
import { CategoryUpdateDto } from '../core/dto/category/category-update.dto';
import { CategoryDeleteDto } from '../core/dto/category/category-delete.dto';
import { MarkdownPipe } from '../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../standalone/pipes/sanitizer.pipe';
import { DropdownComponent } from '../standalone/components/dropdown/dropdown.component';
import { AppTextareaResizeDirective } from '../standalone/directives/app-textarea-resize.directive';
import { CurrentUser } from '../core/models/current-user.model';
import { UserPostComponent } from './post/post.component';
import { SkeletonService } from '../core/services/skeleton.service';
import { UserGetAllDto } from '../core/dto/user/user-get-all.dto';
import { AppSkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { FileService } from '../core/services/file.service';
import { PostService } from '../core/services/post.service';
import { PostGetAllDto } from '../core/dto/post/post-get-all.dto';

interface PostSearchForm {
	query: FormControl<string>;
	orderBy: FormControl<string>;
}

interface CategoryEditForm {
	name: FormControl<string>;
	description: FormControl<string | null>;
}

interface CategoryDeleteForm {
	name: FormControl<string>;
	categoryId: FormControl<number>;
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
		AppTextareaResizeDirective,
		AppSkeletonDirective
	],
	selector: 'app-user',
	templateUrl: './user.component.html'
})
export class UserComponent implements OnInit, OnDestroy {
	// prettier-ignore
	@ViewChild('categoryEditFormModal') categoryEditFormModal: ElementRef<HTMLDialogElement> | undefined;

	// prettier-ignore
	@ViewChild('categoryDeleteFormModal') categoryDeleteFormModal: ElementRef<HTMLDialogElement> | undefined;

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

	categoryEditForm: FormGroup | undefined;
	categoryEditFormIsPristine$: Subscription | undefined;
	categoryEditFormIsPristine: boolean = false;

	categoryDeleteForm: FormGroup | undefined;
	categoryDeleteForm$: Subscription | undefined;
	categoryDeleteFormPostList: Post[] = [];

	constructor(
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private helperService: HelperService,
		private authorizationService: AuthorizationService,
		private categoryService: CategoryService,
		private snackbarService: SnackbarService,
		private userService: UserService,
		private skeletonService: SkeletonService,
		private postService: PostService,
		private fileService: FileService
	) {
		this.categoryEditForm = this.formBuilder.group<CategoryEditForm>({
			name: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(36)
			]),
			description: this.formBuilder.control(null, [Validators.maxLength(255)])
		});
		this.categoryDeleteForm = this.formBuilder.group<CategoryDeleteForm>({
			name: this.formBuilder.nonNullable.control('', []),
			categoryId: this.formBuilder.control(null, [])
		});
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
			this.postSearchFormIsSubmitted$,
			this.categoryEditFormIsPristine$,
			this.categoryDeleteForm$
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

	onToggleCategoryEditForm(toggle: boolean): void {
		if (toggle) {
			this.categoryEditForm.patchValue(this.category);
			this.categoryEditForm.markAllAsTouched();
			this.categoryEditFormModal.nativeElement.showModal();
			this.categoryEditFormIsPristine$ = this.categoryEditForm.valueChanges
				.pipe(startWith(this.categoryEditForm.value))
				.subscribe({
					next: (value: any) => {
						this.categoryEditFormIsPristine = Object.keys(value).every((key: string) => {
							return value[key] === this.category[key];
						});
					},
					error: (error: any) => console.error(error)
				});
		} else {
			this.categoryEditForm.reset();
			this.categoryEditFormModal.nativeElement.close();
			this.categoryEditFormIsPristine = true;
			this.categoryEditFormIsPristine$?.unsubscribe();
		}
	}

	onToggleCategoryDeleteForm(toggle: boolean): void {
		if (toggle) {
			this.categoryDeleteForm.reset();
			this.categoryDeleteFormModal.nativeElement.showModal();
			this.categoryDeleteFormPostList = this.userPostComponent.abstractList;

			const abstractControl: AbstractControl = this.categoryDeleteForm.get('name');

			abstractControl.setValidators([
				Validators.required,
				Validators.pattern(this.helperService.getRegex('exact', this.category.name))
			]);

			abstractControl.updateValueAndValidity();
		} else {
			this.categoryDeleteForm.reset();
			this.categoryDeleteFormModal.nativeElement.close();
			this.categoryDeleteFormPostList = [];
		}
	}

	onSubmitCategoryEditForm(): void {
		if (this.helperService.getFormValidation(this.categoryEditForm)) {
			this.categoryEditForm.disable();

			const categoryId: number = this.category.id;
			const categoryUpdateDto: CategoryUpdateDto = {
				...this.categoryEditForm.value
			};

			this.categoryService.update(categoryId, categoryUpdateDto).subscribe({
				next: (category: Category) => {
					this.snackbarService.success(null, 'Category updated');

					this.category = category;
					this.categoryList = this.categoryList.map((category: Category) => {
						return category.id === this.category.id ? this.category : category;
					});

					this.categoryEditForm.enable();

					this.onToggleCategoryEditForm(false);
				},
				error: () => this.categoryEditForm.enable()
			});
		}
	}

	onSubmitCategoryDeleteForm(): void {
		if (this.helperService.getFormValidation(this.categoryDeleteForm)) {
			this.categoryDeleteForm.disable();

			const categoryId: number = this.category.id;
			const categoryDeleteDto: CategoryDeleteDto = {};
			const categoryDeleteRedirect: string[] = [this.userService.getUserUrl(this.user)];

			const abstractControl: AbstractControl = this.categoryDeleteForm.get('categoryId');

			// Move posts if provided categoryId OR delete their images at the same time

			if (abstractControl.value) {
				categoryDeleteDto.categoryId = abstractControl.value;
				categoryDeleteRedirect.push('category', abstractControl.value);
			} else {
				const postGetAllDto: PostGetAllDto = {
					categoryId
				};

				this.postService
					.getAll(postGetAllDto)
					.pipe(filter((postList: Post[]) => !!postList.length))
					.subscribe({
						next: (postList: Post[]) => {
							postList
								.filter((post: Post) => !!post.image)
								.forEach((post: Post) => this.fileService.delete(post.image));
						},
						error: (error: any) => console.error(error)
					});
			}

			this.categoryService.delete(categoryId, categoryDeleteDto).subscribe({
				next: () => {
					this.snackbarService.success(null, 'Category deleted');

					this.category = undefined;
					this.categoryList = this.categoryList.filter((category: Category) => {
						return category.id !== categoryId;
					});

					this.categoryDeleteForm.enable();

					this.onToggleCategoryDeleteForm(false);

					this.router.navigate(categoryDeleteRedirect).then(() => console.debug('Route changed'));
				},
				error: () => this.categoryDeleteForm.enable()
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
}
