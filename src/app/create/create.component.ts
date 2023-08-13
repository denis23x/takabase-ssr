/** @format */

import {
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { iif, of, Subscription, switchMap } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { AppInputTrimWhitespaceDirective } from '../standalone/directives/app-input-trim-whitespace.directive';
import { DropdownComponent } from '../standalone/components/dropdown/dropdown.component';
import { WindowComponent } from '../standalone/components/window/window.component';
import { CropperComponent } from '../standalone/components/cropper/cropper.component';
import { ShareComponent } from '../standalone/components/share/share.component';
import { MarkdownComponent } from '../standalone/components/markdown/markdown.component';
import { PostDetailComponent } from '../standalone/components/post/prose/prose.component';
import { Category } from '../core/models/category.model';
import { Post } from '../core/models/post.model';
import { User } from '../core/models/user.model';
import { HelperService } from '../core/services/helper.service';
import { PostService } from '../core/services/post.service';
import { SnackbarService } from '../core/services/snackbar.service';
import { AuthService } from '../core/services/auth.service';
import { CategoryService } from '../core/services/category.service';
import { UserService } from '../core/services/user.service';
import { PostCreateDto } from '../core/dto/post/post-create.dto';
import { FileCreateDto } from '../core/dto/file/file-create.dto';
import { CategoryCreateDto } from '../core/dto/category/category-create.dto';
import { AppScrollIntoViewDirective } from '../standalone/directives/app-scroll-into-view.directive';
import { CookieService } from '../core/services/cookie.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { MetaService } from '../core/services/meta.service';

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
	description: FormControl<string | null>;
}

@Component({
	standalone: true,
	selector: 'app-markdown',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		SvgIconComponent,
		AppInputTrimWhitespaceDirective,
		DropdownComponent,
		WindowComponent,
		CropperComponent,
		PostDetailComponent,
		ShareComponent,
		MarkdownComponent,
		NgOptimizedImage,
		AppScrollIntoViewDirective
	],
	templateUrl: './create.component.html'
})
export class CreateComponent implements OnInit, OnDestroy {
	// prettier-ignore
	@ViewChild('postFormPreviewModal') postFormPreviewModal: ElementRef<HTMLDialogElement> | undefined;

	// prettier-ignore
	@ViewChild('categoryFormModal') categoryFormModal: ElementRef<HTMLDialogElement> | undefined;

	// prettier-ignore
	@ViewChild('postFormImageModal') postFormImageModal: ElementRef<HTMLDialogElement> | undefined;

	// prettier-ignore
	@ViewChild('postDeleteModal') postDeleteModal: ElementRef<HTMLDialogElement> | undefined;

	activatedRouteData$: Subscription | undefined;

	category: Category | undefined;
	categoryList: Category[] = [];
	categoryForm: FormGroup | undefined;

	post: Post | undefined;
	postForm: FormGroup | undefined;
	postForm$: Subscription | undefined;
	postFormIsPristine: boolean = false;
	postFormPreviewPost: Post | undefined;

	postMarkdownModalToggle: boolean = false;
	postMarkdownMonospace: boolean = false;

	postDeleteIsSubmitted: boolean = false;

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
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private helperService: HelperService,
		private postService: PostService,
		private snackbarService: SnackbarService,
		private authService: AuthService,
		private categoryService: CategoryService,
		private userService: UserService,
		private cookieService: CookieService,
		private metaService: MetaService
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
				Validators.maxLength(36)
			]),
			description: this.formBuilder.control(null, [Validators.maxLength(255)])
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

		/** Set appearance settings */

		this.setAppearance();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.activatedRouteData$, this.postForm$, this.authUser$].forEach($ => $?.unsubscribe());
	}

	setAppearance(): void {
		// prettier-ignore
		this.postMarkdownMonospace = !!Number(this.cookieService.getItem('markdown-monospace'));
	}

	setMetaTags(): void {
		const title: string = 'Create post';

		// prettier-ignore
		const description: string = 'Create and share your thoughts with a new post on our platform';

		const metaOpenGraph: MetaOpenGraph = {
			['og:title']: title,
			['og:description']: description,
			['og:type']: 'website'
		};

		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description
		};

		this.metaService.setMeta(metaOpenGraph, metaTwitter);
	}

	onTogglePostFormImage(toggle: boolean): void {
		this.onSubmitPostFormStatus(toggle);

		if (toggle) {
			this.postFormImageModal.nativeElement.showModal();
		} else {
			this.postFormImageModal.nativeElement.close();
		}
	}

	onToggleCategory(toggle: boolean): void {
		const abstractControl: AbstractControl = this.postForm.get('categoryName');

		if (this.categoryList.length) {
			if (!toggle && !abstractControl.value) {
				abstractControl.setErrors({ required: true });
			}
		} else {
			if (toggle) {
				this.onToggleCategoryForm(true);
			}
		}
	}

	onToggleCategoryForm(toggle: boolean): void {
		this.onSubmitPostFormStatus(toggle);

		if (toggle) {
			this.categoryFormModal.nativeElement.showModal();
		} else {
			this.categoryFormModal.nativeElement.close();
		}

		this.categoryForm.reset();
	}

	onTogglePreviewPost(toggle: boolean): void {
		this.onSubmitPostFormStatus(toggle);

		if (toggle) {
			this.postFormPreviewModal.nativeElement.showModal();
			this.postFormPreviewPost = {
				...this.postForm.value,
				user: this.authUser,
				category: this.category
			};
		} else {
			this.postFormPreviewModal.nativeElement.close();
			this.postFormPreviewPost = undefined;
		}
	}

	onToggleDeletePost(toggle: boolean): void {
		this.onSubmitPostFormStatus(toggle);

		if (toggle) {
			this.postDeleteModal.nativeElement.showModal();
		} else {
			this.postDeleteModal.nativeElement.close();
		}
	}

	onToggleMarkdownModal(toggle: boolean): void {
		this.onSubmitPostFormStatus(toggle);

		this.postMarkdownModalToggle = toggle;
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

	onSubmitPostFormStatus(toggle: boolean): void {
		if (toggle) {
			this.postForm.disable({ emitEvent: false });
		} else {
			this.postForm.enable({ emitEvent: false });
		}
	}

	onSubmitPostForm(): void {
		if (this.helperService.getFormValidation(this.postForm)) {
			this.postForm.disable();

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
            .navigate([this.userService.getUserUrl(post.user), 'category', post.category.id, 'post', post.id])
            .then(() => this.snackbarService.success('Cheers!', 'Post has been saved'));
				},
				error: () => this.postForm.enable()
			});
		}
	}

	onSubmitPostFormImage(fileCreateDto?: FileCreateDto): void {
		this.onTogglePostFormImage(false);

		this.postForm.get('image').setValue(fileCreateDto.path);
	}

	onSubmitCategoryForm(): void {
		if (this.helperService.getFormValidation(this.categoryForm)) {
			this.categoryForm.disable();

			const categoryCreateDto: CategoryCreateDto = {
				...this.categoryForm.value
			};

			this.categoryService.create(categoryCreateDto).subscribe({
				next: (category: Category) => {
					this.snackbarService.success('Cheers!', 'Category created');

					this.categoryList.unshift(category);
					this.categoryForm.enable();

					this.onSelectCategory(category);
					this.onToggleCategoryForm(false);
				},
				error: () => this.categoryForm.enable()
			});
		}
	}

	onSubmitPostDelete(): void {
		this.postDeleteIsSubmitted = true;

		const postId: number = this.post.id;

		this.postService.delete(postId).subscribe({
			next: () => {
				// prettier-ignore
				this.router
          .navigate([this.userService.getUserUrl(this.post.user), 'category', this.post.category.id])
          .then(() => this.snackbarService.success('Sadly..', 'Post has been deleted'));
			},
			error: () => (this.postDeleteIsSubmitted = false)
		});
	}
}
