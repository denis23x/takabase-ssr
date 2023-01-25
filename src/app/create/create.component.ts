/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	PlatformService,
	HelperService,
	Post,
	Category,
	PostCreateDto,
	PostService,
	SnackbarService,
	User,
	AuthService,
	FileCreateDto,
	CategoryCreateDto,
	CategoryService
} from '../core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { iif, of, Subscription, switchMap } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';

interface PostForm {
	name: FormControl<string>;
	image: FormControl<string>;
	description: FormControl<string>;
	categoryId: FormControl<number>;
	categoryName: FormControl<string>;
	markdown: FormControl<string>;
}

interface CategoryForm {
	name: FormControl<string>;
	description: FormControl<string>;
}

@Component({
	selector: 'app-markdown',
	templateUrl: './create.component.html'
})
export class CreateComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	category: Category | undefined;
	categoryList: Category[] = [];
	categoryForm: FormGroup | undefined;
	categoryFormIsSubmitted: boolean = false;
	categoryFormToggle: boolean = false;

	post: Post | undefined;
	postForm: FormGroup | undefined;
	postForm$: Subscription | undefined;
	postFormIsPristine: boolean = false;
	postFormIsSubmitted: boolean = false;
	postFormImageToggle: boolean = false;
	postFormPreviewToggle: boolean = false;
	postFormPreviewPost: Post | undefined;

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	fullscreenToggle: boolean = false;
	fullscreenClassList: string[] = [
		'border',
		'border-base-content/20',
		'rounded-box',
		'shadow-xl'
	];
	fullscreenScrollSync: boolean = false;
	fullscreenDisableTextWrapping: boolean = false;
	fullscreenHiddenMarkdown: boolean = false;
	fullscreenHiddenRender: boolean = false;
	fullscreenHiddenControls: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private platformService: PlatformService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private helperService: HelperService,
		private postService: PostService,
		private snackbarService: SnackbarService,
		private authService: AuthService,
		private categoryService: CategoryService
	) {
		this.postForm = this.formBuilder.group<PostForm>({
			name: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(36)
			]),
			image: this.formBuilder.nonNullable.control('', []),
			description: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(255)
			]),
			categoryId: this.formBuilder.control(null, [Validators.required]),
			categoryName: this.formBuilder.nonNullable.control('', []),
			markdown: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(24),
				Validators.maxLength(7200)
			])
		});

		this.categoryForm = this.formBuilder.group<CategoryForm>({
			name: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(24)
			]),
			description: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(255)
			])
		});
	}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(
				map((data: Data) => data.data),
				switchMap(([categoryList, post]: [Category[], Post]) => {
					// prettier-ignore
					this.category = categoryList.find((category: Category) => category.id === post?.category.id);
					this.categoryList = categoryList;

					return of(post);
				}),
				filter((post: Post) => !!post)
			)
			.subscribe({
				next: (post: Post) => {
					this.post = post;

					this.postForm.patchValue({
						...this.post,
						categoryId: this.post.category.id,
						categoryName: this.post.category.name
					});

					this.postForm.markAllAsTouched();
				},
				error: (error: any) => console.error(error)
			});

		this.postForm$ = this.postForm.valueChanges
			.pipe(
				startWith(this.postForm.value),
				filter(() => !!this.post)
			)
			.subscribe({
				next: (value: any) => {
					this.postFormIsPristine = Object.keys(value).every((key: string) => {
						if (key === 'categoryId') {
							return value[key] === this.post.category.id;
						}

						if (key === 'categoryName') {
							return value[key] === this.post.category.name;
						}

						return value[key] === this.post[key];
					});
				}
			});

		this.authUser$ = this.authService.user.subscribe({
			next: (user: User) => (this.authUser = user),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.activatedRouteData$, this.postForm$, this.authUser$].forEach($ => $?.unsubscribe());
	}

	onToggleCategory(toggle: boolean): void {
		const abstractControl: AbstractControl = this.postForm.get('categoryName');

		if (this.categoryList.length) {
			if (!toggle && !abstractControl.value) {
				abstractControl.setErrors({ required: true });
			}
		} else {
			if (!!toggle) {
				this.onToggleCategoryForm(true);
			}
		}
	}

	onToggleCategoryForm(toggle: boolean): void {
		this.categoryFormToggle = toggle;
		this.categoryForm.reset();
	}

	onTogglePreviewPost(): void {
		this.postFormPreviewPost = {
			...this.postForm.value,
			user: this.authUser,
			category: this.category
		};

		this.postFormPreviewToggle = true;
	}

	onSelectCategory(category: Category): void {
		this.category = category;

		this.postForm.patchValue({
			categoryId: this.category.id,
			categoryName: this.category.name
		});

		this.postForm.get('categoryName').markAsTouched();
	}

	onFullscreen(toggle: boolean): void {
		this.fullscreenToggle = toggle;

		if (this.fullscreenToggle) {
			this.fullscreenClassList = [
				'fixed',
				'top-0',
				'left-0',
				'!m-0',
				'w-full',
				'h-full'
			];
		} else {
			this.fullscreenClassList = [
				'border',
				'border-base-content/20',
				'rounded-box',
				'shadow-xl'
			];
		}
	}

	onFullscreenHide(view: string): void {
		// prettier-ignore
		if (view === 'fullscreenHiddenMarkdown' || view === 'fullscreenHiddenRender') {
			const viewOpposite: string = view === 'fullscreenHiddenMarkdown' ? 'fullscreenHiddenRender' : 'fullscreenHiddenMarkdown';

			if (this[viewOpposite]) {
				this[viewOpposite] = !this[viewOpposite];
			}

			this[view] = !this[view];
		} else {
			this.fullscreenHiddenControls = !this.fullscreenHiddenControls;
		}
	}

	onSubmitPostForm(): void {
		if (this.helperService.getFormValidation(this.postForm)) {
			this.postFormIsSubmitted = true;

			// prettier-ignore
			const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
			const postCreateDto: PostCreateDto = {
				...this.postForm.value
			};

			iif(
				() => !!postId,
				this.postService.update(postId, postCreateDto),
				this.postService.create(postCreateDto)
			).subscribe({
				next: (post: Post) => {
					// prettier-ignore
					this.router
            .navigate(['/@' + post.user.name, 'category', post.category.id, 'post', post.id])
            .then(() => this.snackbarService.success('Cheers!', 'Post has been saved'));
				},
				error: () => (this.postFormIsSubmitted = false)
			});
		}
	}

	onSubmitPostFormImage(fileCreateDto?: FileCreateDto): void {
		this.postFormImageToggle = false;
		this.postForm.get('image').setValue(fileCreateDto.path);
	}

	onSubmitCategoryForm(): void {
		if (this.helperService.getFormValidation(this.categoryForm)) {
			this.categoryFormIsSubmitted = true;

			const categoryCreateDto: CategoryCreateDto = {
				...this.categoryForm.value
			};

			this.categoryService.create(categoryCreateDto).subscribe({
				next: (category: Category) => {
					this.snackbarService.success('Cheers!', 'Category created');

					this.categoryList.unshift(category);
					this.categoryFormIsSubmitted = false;

					this.onSelectCategory(category);
					this.onToggleCategoryForm(false);
				},
				error: () => (this.categoryFormIsSubmitted = false)
			});
		}
	}
}
