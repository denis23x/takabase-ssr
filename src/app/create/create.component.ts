/** @format */

import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CommonModule, DOCUMENT, NgOptimizedImage } from '@angular/common';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { AppInputTrimWhitespaceDirective } from '../standalone/directives/app-input-trim-whitespace.directive';
import { DropdownComponent } from '../standalone/components/dropdown/dropdown.component';
import { CropperComponent } from '../standalone/components/cropper/cropper.component';
import { MarkdownComponent } from '../standalone/components/markdown/markdown.component';
import { Category } from '../core/models/category.model';
import { Post } from '../core/models/post.model';
import { HelperService } from '../core/services/helper.service';
import { PostService } from '../core/services/post.service';
import { SnackbarService } from '../core/services/snackbar.service';
import { AuthorizationService } from '../core/services/authorization.service';
import { CategoryService } from '../core/services/category.service';
import { UserService } from '../core/services/user.service';
import { PostCreateDto } from '../core/dto/post/post-create.dto';
import { AppScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { CookieService } from '../core/services/cookie.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { MetaService } from '../core/services/meta.service';
import { AppTextareaAutosizeDirective } from '../standalone/directives/app-textarea-autosize.directive';
import { CurrentUser } from '../core/models/current-user.model';
import { CategoryGetAllDto } from '../core/dto/category/category-get-all.dto';
import { PostGetOneDto } from '../core/dto/post/post-get-one.dto';
import { AppSkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { SkeletonService } from '../core/services/skeleton.service';
import { CategoryCreateComponent } from '../standalone/components/category/create/create.component';
import { CategoryUpdateComponent } from '../standalone/components/category/update/update.component';
import { PostPreviewComponent } from '../standalone/components/post/preview/preview.component';
import { PlatformService } from '../core/services/platform.service';
import { FileService } from '../core/services/file.service';
import { PostUpdateDto } from '../core/dto/post/post-update.dto';
import { PostDeleteComponent } from '../standalone/components/post/delete/delete.component';
import { PostDeleteImageComponent } from '../standalone/components/post/delete-image/delete-image.component';

interface PostForm {
	name: FormControl<string>;
	image: FormControl<string | null>;
	description: FormControl<string>;
	categoryId: FormControl<number>;
	categoryName: FormControl<string>;
	markdown: FormControl<string>;
}

@Component({
	standalone: true,
	selector: 'app-create',
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		SvgIconComponent,
		AppInputTrimWhitespaceDirective,
		DropdownComponent,
		CropperComponent,
		MarkdownComponent,
		NgOptimizedImage,
		AppScrollPresetDirective,
		AppTextareaAutosizeDirective,
		AppSkeletonDirective,
		PostDeleteComponent,
		PostDeleteImageComponent,
		CategoryCreateComponent,
		CategoryUpdateComponent,
		PostPreviewComponent
	],
	templateUrl: './create.component.html'
})
export class CreateComponent implements OnInit, OnDestroy {
	// prettier-ignore
	@ViewChild('appCategoryCreateComponent') appCategoryCreateComponent: CategoryCreateComponent | undefined;
	@ViewChild('appMarkdownComponent') appMarkdownComponent: MarkdownComponent | undefined;

	@ViewChild('postFormImageDialog') postFormImageDialog: ElementRef<HTMLDialogElement> | undefined;

	category: Category | undefined;
	categorySkeletonToggle: boolean = true;

	categoryList: Category[] = [];
	categoryListRequest$: Subscription | undefined;
	categoryListSkeletonToggle: boolean = true;

	post: Post | undefined;
	postRequest$: Subscription | undefined;
	postSkeletonToggle: boolean = true;
	postSkeletonImageToggle: boolean = false;

	postForm: FormGroup | undefined;
	postFormRequest$: Subscription | undefined;
	postFormIsPristine: boolean = false;
	postFormIsPristine$: Subscription | undefined;

	postFormTextareaId: string = 'postFormTextarea';
	postFormPreviewId: string = 'postFormPreview';

	postMarkdownDialogToggle: boolean = false;
	postMarkdownMonospace: boolean = false;

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	fullscreenToggle: boolean = false;
	fullscreenClassList: string[] = ['border', 'border-base-content/20', 'rounded-box', 'shadow-xl'];
	fullscreenScrollSync: boolean = false;
	fullscreenTextWrapping: boolean = false;
	fullscreenMarkdown: boolean = false;
	fullscreenRender: boolean = false;

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private formBuilder: FormBuilder,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private helperService: HelperService,
		private postService: PostService,
		private snackbarService: SnackbarService,
		private authorizationService: AuthorizationService,
		private categoryService: CategoryService,
		private userService: UserService,
		private cookieService: CookieService,
		private metaService: MetaService,
		private fileService: FileService,
		private skeletonService: SkeletonService,
		private platformService: PlatformService
	) {
		this.postForm = this.formBuilder.group<PostForm>({
			name: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(36)
			]),
			image: this.formBuilder.control(null, []),
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
	}

	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService
			.getCurrentUser()
			.pipe(tap((currentUser: CurrentUser) => (this.currentUser = currentUser)))
			.subscribe({
				next: () => {
					/** Apply Data */

					this.setSkeleton();
					this.setResolver();
				},
				error: (error: any) => console.error(error)
			});

		/** Apply appearance settings */

		this.setAppearance();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[
			this.currentUser$,
			this.categoryListRequest$,
			this.postRequest$,
			this.postFormRequest$,
			this.postFormIsPristine$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		// Get categoryList

		this.categoryList = this.skeletonService.getCategoryList();
		this.categoryListSkeletonToggle = true;

		// Get post && Set category

		const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));

		if (postId) {
			this.post = this.skeletonService.getPost(['category']);
			this.postSkeletonToggle = true;
		}

		this.category = this.skeletonService.getCategory();
		this.categorySkeletonToggle = true;
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			// Get categoryList

			const categoryGetAllDto: CategoryGetAllDto = {
				page: 1,
				size: 999,
				userId: this.currentUser.id
			};

			this.categoryListRequest$?.unsubscribe();
			this.categoryListRequest$ = this.categoryService.getAll(categoryGetAllDto).subscribe({
				next: (categoryList: Category[]) => {
					this.categoryList = categoryList;
					this.categoryListSkeletonToggle = false;
				},
				error: (error: any) => console.error(error)
			});

			// Get post && Set category

			const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));

			if (postId) {
				const postGetOneDto: PostGetOneDto = {
					userId: this.currentUser.id,
					scope: ['category']
				};

				this.postRequest$?.unsubscribe();
				this.postRequest$ = this.postService.getOne(postId, postGetOneDto).subscribe({
					next: (post: Post) => {
						this.post = post;
						this.postSkeletonToggle = false;

						this.category = this.post.category;
						this.categorySkeletonToggle = false;

						this.postForm.patchValue({
							...this.post,
							categoryId: this.category.id,
							categoryName: this.category.name
						});

						this.postForm.markAllAsTouched();

						// Get postFormIsPristine

						this.postFormIsPristine$?.unsubscribe();
						this.postFormIsPristine$ = this.postForm.valueChanges
							.pipe(startWith(this.postForm.value))
							.subscribe({
								next: (value: any) => {
									this.postFormIsPristine = Object.keys(value).every((key: string) => {
										if (key === 'categoryId') {
											return value[key] === this.post.category.id;
										}

										if (key === 'categoryName') {
											return value[key] === this.post.category.name;
										}

										// @ts-ignore
										return value[key] === this.post[key];
									});
								},
								error: (error: any) => console.error(error)
							});
					},
					error: (error: any) => console.error(error)
				});
			} else {
				this.post = undefined;
				this.postSkeletonToggle = false;

				this.category = undefined;
				this.categorySkeletonToggle = false;
			}
		}
	}

	setAppearance(): void {
		this.postMarkdownMonospace = !!Number(this.cookieService.getItem('markdown-monospace'));
	}

	setMetaTags(): void {
		const title: string = 'Create post';
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

	onToggleMarkdownDialog(toggle: boolean): void {
		this.postMarkdownDialogToggle = toggle;

		this.onTogglePostFormStatus(toggle);
	}

	onToggleMarkdownUpload(toggle: boolean): void {
		const abstractControl: AbstractControl = this.postForm.get('markdown');

		if (toggle) {
			abstractControl.disable();
		} else {
			abstractControl.enable();
		}
	}

	/** Category */

	onToggleCategory(toggle: boolean): void {
		const abstractControl: AbstractControl = this.postForm.get('categoryName');

		if (this.categoryList.length) {
			if (!toggle && !abstractControl.value) {
				abstractControl.setErrors({ required: true });
			}
		} else {
			if (toggle) {
				this.appCategoryCreateComponent.onToggleCategoryCreateDialog(true);
			}
		}
	}

	onCreateCategory(categoryCreate: Category): void {
		this.categoryList.unshift(categoryCreate);

		this.onSelectCategory(categoryCreate);
	}

	onUpdateCategory(categoryUpdate: Category): void {
		this.categoryList = this.categoryList.map((category: Category) => {
			return category.id === categoryUpdate.id ? categoryUpdate : category;
		});

		this.onSelectCategory(categoryUpdate);
	}

	onSelectCategory(categorySelect: Category): void {
		this.category = categorySelect;

		this.postForm.patchValue({
			categoryId: this.category.id,
			categoryName: this.category.name
		});

		this.postForm.get('categoryName').markAsTouched();
	}

	/** Image Cropper */

	onUpdateCropperImage(image: string | null): void {
		const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
		const postUpdateDto: PostUpdateDto = {
			image
		};

		if (postId) {
			this.postSkeletonImageToggle = true;

			this.postFormRequest$?.unsubscribe();
			this.postFormRequest$ = this.postService.update(postId, postUpdateDto).subscribe({
				next: () => {
					this.postSkeletonImageToggle = false;

					this.snackbarService.success('Alright', 'Post has been updated');
				},
				error: () => (this.postSkeletonImageToggle = false)
			});
		} else {
			this.postSkeletonImageToggle = false;
		}

		/** Update postForm image */

		this.postForm.get('image').setValue(image, { emitEvent: false });
	}

	onSubmitCropperImage(file: File): void {
		const abstractControl: AbstractControl = this.postForm.get('image');
		const abstractControlPreviousValue: string | null = abstractControl.value;

		this.postSkeletonImageToggle = true;

		this.fileService.create(file, '/upload/post-images').subscribe({
			next: (fileUrl: string) => {
				this.onUpdateCropperImage(fileUrl);

				/** Silent deleting image */

				if (abstractControlPreviousValue) {
					this.fileService.delete(abstractControlPreviousValue).subscribe({
						next: () => console.debug('File erased'),
						error: (error: any) => console.error(error)
					});
				}
			},
			error: () => (this.postSkeletonImageToggle = false)
		});
	}

	/** Fullscreen */

	onFullscreen(toggle: boolean): void {
		this.fullscreenToggle = toggle;

		if (this.fullscreenToggle) {
			this.fullscreenScrollSync = true;
			this.fullscreenTextWrapping = true;
			this.fullscreenMarkdown = true;
			this.fullscreenRender = true;
			this.fullscreenClassList = ['fixed', 'top-0', 'left-0', '!m-0', 'w-full', 'h-full'];

			// Force dispatch input event for re-render markdown in preview element

			this.document.getElementById(this.postFormTextareaId).dispatchEvent(new Event('input'));
		} else {
			this.fullscreenScrollSync = false;
			this.fullscreenTextWrapping = false;
			this.fullscreenMarkdown = false;
			this.fullscreenRender = false;
			this.fullscreenClassList = ['border', 'border-base-content/20', 'rounded-box', 'shadow-xl'];
		}
	}

	onFullscreenHide(view: string): void {
		// prettier-ignore
		const viewOpposite: string = view === 'fullscreenMarkdown' ? 'fullscreenRender' : 'fullscreenMarkdown';

		// @ts-ignore
		if (!this[viewOpposite]) {
			// @ts-ignore
			this[viewOpposite] = !this[viewOpposite];
		}

		// @ts-ignore
		this[view] = !this[view];
	}

	/** postForm */

	onTogglePostFormStatus(toggle: boolean): void {
		if (toggle) {
			this.postForm.disable({ emitEvent: false });
		} else {
			this.postForm.enable({ emitEvent: false });
		}
	}

	onSubmitPostForm(): void {
		if (this.helperService.getFormValidation(this.postForm)) {
			this.postForm.disable();

			const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
			const postCreateDto: PostCreateDto = {
				...this.postForm.value
			};

			// prettier-ignore
			const postFormRequestRedirect = (post: Post): void => {
				this.router
          .navigate([this.userService.getUserUrl(post.user), 'category', post.category.id, 'post', post.id])
          .then(() => this.snackbarService.success('Cheers!', 'Post has been saved'));
			};

			if (postId) {
				this.postFormRequest$?.unsubscribe();
				this.postFormRequest$ = this.postService.update(postId, postCreateDto).subscribe({
					next: (post: Post) => postFormRequestRedirect(post),
					error: () => this.postForm.enable()
				});
			} else {
				this.postFormRequest$?.unsubscribe();
				this.postFormRequest$ = this.postService.create(postCreateDto).subscribe({
					next: (post: Post) => postFormRequestRedirect(post),
					error: () => this.postForm.enable()
				});
			}
		}
	}
}
