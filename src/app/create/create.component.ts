/** @format */

import {
	Component,
	computed,
	inject,
	OnDestroy,
	OnInit,
	signal,
	Signal,
	ViewChild,
	WritableSignal
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { filter, map, startWith, tap } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DOCUMENT, NgOptimizedImage } from '@angular/common';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { InputTrimWhitespaceDirective } from '../standalone/directives/app-input-trim-whitespace.directive';
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
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { CookiesService } from '../core/services/cookies.service';
import { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import { MetaService } from '../core/services/meta.service';
import { TextareaAutosizeDirective } from '../standalone/directives/app-textarea-autosize.directive';
import { CurrentUser } from '../core/models/current-user.model';
import { CategoryGetAllDto } from '../core/dto/category/category-get-all.dto';
import { PostGetOneDto } from '../core/dto/post/post-get-one.dto';
import { SkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { SkeletonService } from '../core/services/skeleton.service';
import { CategoryCreateComponent } from '../standalone/components/category/create/create.component';
import { CategoryUpdateComponent } from '../standalone/components/category/update/update.component';
import { PostPreviewComponent } from '../standalone/components/post/preview/preview.component';
import { PlatformService } from '../core/services/platform.service';
import { FileService } from '../core/services/file.service';
import { PostUpdateDto } from '../core/dto/post/post-update.dto';
import { PostDeleteComponent } from '../standalone/components/post/delete/delete.component';
import { BadgeErrorComponent } from '../standalone/components/badge-error/badge-error.component';
import { ShortcutsComponent } from '../standalone/components/shortcuts/shortcuts.component';
import { KbdPipe } from '../standalone/pipes/kbd.pipe';
import { PlatformDirective } from '../standalone/directives/app-platform.directive';
import { DeviceDirective } from '../standalone/directives/app-device.directive';
import { AIModerateTextDto } from '../core/dto/ai/ai-moderate-text.dto';
import { AIService } from '../core/services/ai.service';
import { AppCheckPipe } from '../standalone/pipes/app-check.pipe';

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
		InputTrimWhitespaceDirective,
		DropdownComponent,
		CropperComponent,
		MarkdownComponent,
		NgOptimizedImage,
		ScrollPresetDirective,
		TextareaAutosizeDirective,
		SkeletonDirective,
		PostDeleteComponent,
		CategoryCreateComponent,
		CategoryUpdateComponent,
		PostPreviewComponent,
		BadgeErrorComponent,
		ShortcutsComponent,
		KbdPipe,
		PlatformDirective,
		DeviceDirective,
		AppCheckPipe
	],
	templateUrl: './create.component.html'
})
export class CreateComponent implements OnInit, OnDestroy {
	private readonly document: Document = inject(DOCUMENT);
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly router: Router = inject(Router);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly postService: PostService = inject(PostService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly categoryService: CategoryService = inject(CategoryService);
	private readonly userService: UserService = inject(UserService);
	private readonly cookiesService: CookiesService = inject(CookiesService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly fileService: FileService = inject(FileService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly aiService: AIService = inject(AIService);

	@ViewChild('appCategoryCreateComponent') appCategoryCreateComponent: CategoryCreateComponent | undefined;

	category: Category | undefined;
	categorySkeletonToggle: boolean = true;

	categoryList: Category[] = [];
	categoryListRequest$: Subscription | undefined;
	categoryListSkeletonToggle: boolean = true;

	post: Post | undefined;
	postRequest$: Subscription | undefined;
	postSkeletonToggle: boolean = true;

	postForm: FormGroup = this.formBuilder.group<PostForm>({
		name: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(4),
			Validators.maxLength(48)
		]),
		image: this.formBuilder.control(null, []),
		description: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(16),
			Validators.maxLength(192)
		]),
		categoryId: this.formBuilder.control(null, [Validators.required]),
		categoryName: this.formBuilder.nonNullable.control('', []),
		markdown: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(64),
			Validators.maxLength(8192)
		])
	});
	postFormRequest$: Subscription | undefined;
	postFormIsPristine: boolean = false;
	postFormIsPristine$: Subscription | undefined;
	postFormImageRequest$: Subscription | undefined;
	postFormImageIsSubmitted: WritableSignal<boolean> = signal(false);

	postFormTextareaPlaceholderModifierKey: Signal<string> = computed(() => {
		return this.platformService.getOSModifierKey();
	});
	postFormTextareaPlaceholderToggle: boolean = true;
	postFormTextareaIsSubmitted: WritableSignal<boolean> = signal(false);
	postFormTextareaId: string = 'postFormTextarea';
	postFormTextareaMonospace: boolean = false;
	postFormPreviewId: string = 'postFormPreview';

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	fullscreenToggle: boolean = false;
	fullscreenClassList: string[] = ['border', 'border-base-content/20', 'rounded-box', 'shadow-xl'];
	fullscreenScrollSync: boolean = false;
	fullscreenTextWrapping: boolean = false;
	fullscreenMarkdown: boolean = false;
	fullscreenRender: boolean = false;

	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService
			.getCurrentUser()
			.pipe(
				filter((currentUser: CurrentUser | undefined) => !!currentUser),
				tap((currentUser: CurrentUser) => (this.currentUser = currentUser))
			)
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
			this.postFormImageRequest$,
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
				size: 50,
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

						// Force dispatch input event for re-render markdown in preview element

						this.document.getElementById(this.postFormTextareaId).dispatchEvent(new Event('input'));

						// Get postFormIsPristine

						this.postFormIsPristine$?.unsubscribe();
						this.postFormIsPristine$ = this.postForm.valueChanges.pipe(startWith(this.postForm.value)).subscribe({
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

	/** Extra */

	setAppearance(): void {
		this.postFormTextareaMonospace = !!Number(this.cookiesService.getItem('markdown-monospace'));
	}

	setMetaTags(): void {
		const title: string = 'Create post';
		const description: string = 'Create and share your thoughts with a new post on the platform';

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

	onUpdateCropperImage(fileUrl: string | null): void {
		this.postForm.get('image').setValue(fileUrl, { emitEvent: true });
		this.postFormImageIsSubmitted.set(false);
	}

	onSubmitCropperImage(file: File): void {
		this.postForm.get('image').setValue(null, { emitEvent: false });
		this.postFormImageIsSubmitted.set(true);

		this.postFormImageRequest$?.unsubscribe();
		this.postFormImageRequest$ = this.fileService
			.create(file)
			.pipe(map((fileUrl: string) => this.fileService.getFileUrlClean(fileUrl)))
			.subscribe({
				next: (fileUrl: string) => this.onUpdateCropperImage(fileUrl),
				error: () => this.postFormImageIsSubmitted.set(false)
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
		} else {
			this.fullscreenScrollSync = false;
			this.fullscreenTextWrapping = false;
			this.fullscreenMarkdown = false;
			this.fullscreenRender = false;
			this.fullscreenClassList = ['border', 'border-base-content/20', 'rounded-box', 'shadow-xl'];
		}
	}

	onFullscreenHide(view: string): void {
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

	onSubmitPostForm(): void {
		if (this.helperService.getFormValidation(this.postForm)) {
			this.postForm.disable();

			const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
			const postDto: PostCreateDto & PostUpdateDto = {
				...this.postForm.value,
				firebaseUid: this.post?.firebaseUid
			};

			const postFormRedirect = (post: Post): void => {
				this.router
					.navigate([this.userService.getUserUrl(post.user), 'category', post.category.id, 'post', post.id])
					.then(() => this.snackbarService.success('Cheers!', 'Post has been saved'));
			};

			const aiModerateTextDto: AIModerateTextDto = {
				model: 'text-moderation-stable',
				input: this.aiService.setInput(postDto)
			};

			/** Moderate and create/update */

			if (postId) {
				this.postFormRequest$?.unsubscribe();
				this.postFormRequest$ = this.aiService
					.moderateText(aiModerateTextDto)
					.pipe(switchMap(() => this.postService.update(postId, postDto)))
					.subscribe({
						next: (post: Post) => postFormRedirect(post),
						error: () => this.postForm.enable()
					});
			} else {
				this.postFormRequest$?.unsubscribe();
				this.postFormRequest$ = this.aiService
					.moderateText(aiModerateTextDto)
					.pipe(switchMap(() => this.postService.create(postDto)))
					.subscribe({
						next: (post: Post) => postFormRedirect(post),
						error: () => this.postForm.enable()
					});
			}
		}
	}
}
