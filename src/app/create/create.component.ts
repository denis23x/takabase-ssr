/** @format */

import {
	AfterViewInit,
	Component,
	ComponentRef,
	computed,
	inject,
	OnDestroy,
	OnInit,
	signal,
	Signal,
	ViewContainerRef,
	WritableSignal
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { from, fromEvent, Observable, Subscription, switchMap, throwError } from 'rxjs';
import { catchError, filter, map, startWith, tap } from 'rxjs/operators';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	FormsModule,
	ReactiveFormsModule,
	ValidatorFn,
	Validators
} from '@angular/forms';
import { CommonModule, DOCUMENT } from '@angular/common';
import { SvgIconComponent } from '../standalone/components/svg-icon/svg-icon.component';
import { InputTrimWhitespaceDirective } from '../standalone/directives/app-input-trim-whitespace.directive';
import { DropdownComponent } from '../standalone/components/dropdown/dropdown.component';
import { MarkdownComponent } from '../standalone/components/markdown/markdown.component';
import { HelperService } from '../core/services/helper.service';
import { PostService } from '../core/services/post.service';
import { PostPrivateService } from '../core/services/post-private.service';
import { PostPasswordService } from '../core/services/post-password.service';
import { SnackbarService } from '../core/services/snackbar.service';
import { CategoryService } from '../core/services/category.service';
import { ScrollPresetDirective } from '../standalone/directives/app-scroll-preset.directive';
import { CookiesService } from '../core/services/cookies.service';
import { MetaService } from '../core/services/meta.service';
import { TextareaAutosizeDirective } from '../standalone/directives/app-textarea-autosize.directive';
import { SkeletonDirective } from '../standalone/directives/app-skeleton.directive';
import { SkeletonService } from '../core/services/skeleton.service';
import { PlatformService } from '../core/services/platform.service';
import { BadgeErrorComponent } from '../standalone/components/badge-error/badge-error.component';
import { ShortcutsComponent } from '../standalone/components/shortcuts/shortcuts.component';
import { KbdPipe } from '../standalone/pipes/kbd.pipe';
import { PlatformDirective } from '../standalone/directives/app-platform.directive';
import { DeviceDirective } from '../standalone/directives/app-device.directive';
import { AIService } from '../core/services/ai.service';
import { BusService } from '../core/services/bus.service';
import { SharpService } from '../core/services/sharp.service';
import { CurrentUserMixin as CU } from '../core/mixins/current-user.mixin';
import { LocalStorageService } from '../core/services/local-storage.service';
import type { MetaOpenGraph, MetaTwitter } from '../core/models/meta.model';
import type { Category } from '../core/models/category.model';
import type { CategoryCreateComponent } from '../standalone/components/category/create/create.component';
import type { CategoryGetAllDto } from '../core/dto/category/category-get-all.dto';
import type { Post, PostType } from '../core/models/post.model';
import type { PostCreateDto } from '../core/dto/post/post-create.dto';
import type { PostDeleteDto } from '../core/dto/post/post-delete.dto';
import type { PostGetOneDto } from '../core/dto/post/post-get-one.dto';
import type { PostUpdateDto } from '../core/dto/post/post-update.dto';
import type { AIModerateTextDto } from '../core/dto/ai/ai-moderate-text.dto';
import type { CropperComponent } from '../standalone/components/cropper/cropper.component';
import type { PostPreviewComponent } from '../standalone/components/post/preview/preview.component';
import type { PostDeleteComponent } from '../standalone/components/post/delete/delete.component';
import type { PostDraftComponent } from '../standalone/components/post/draft/draft.component';
import type { HttpErrorResponse } from '@angular/common/http';

interface PostForm {
	name: FormControl<string>;
	cover: FormControl<string | null>;
	description: FormControl<string | null>;
	categoryId?: FormControl<number>;
	categoryName?: FormControl<string>;
	password?: FormControl<string>;
	markdown: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		FormsModule,
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		SvgIconComponent,
		InputTrimWhitespaceDirective,
		DropdownComponent,
		MarkdownComponent,
		ScrollPresetDirective,
		TextareaAutosizeDirective,
		SkeletonDirective,
		BadgeErrorComponent,
		ShortcutsComponent,
		KbdPipe,
		PlatformDirective,
		DeviceDirective
	],
	providers: [CategoryService, PostService, PostPrivateService, PostPasswordService, AIService, SharpService],
	selector: 'app-create',
	templateUrl: './create.component.html'
})
export class CreateComponent extends CU(class {}) implements OnInit, AfterViewInit, OnDestroy {
	private readonly document: Document = inject(DOCUMENT);
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly router: Router = inject(Router);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly postService: PostService = inject(PostService);
	private readonly postPasswordService: PostPasswordService = inject(PostPasswordService);
	private readonly postPrivateService: PostPrivateService = inject(PostPrivateService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly categoryService: CategoryService = inject(CategoryService);
	private readonly cookiesService: CookiesService = inject(CookiesService);
	private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly sharpService: SharpService = inject(SharpService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly aiService: AIService = inject(AIService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
	private readonly busService: BusService = inject(BusService);

	category: Category | undefined;
	categorySkeletonToggle: boolean = true;

	categoryList: Category[] = [];
	categoryListRequest$: Subscription | undefined;
	categoryListSkeletonToggle: boolean = true;

	post: Post | undefined;
	postRequest$: Subscription | undefined;
	postSkeletonToggle: boolean = true;
	postType: PostType = 'category';
	postTypeOriginal: PostType | undefined;

	postForm: FormGroup = this.formBuilder.group<PostForm>({
		name: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(4),
			Validators.maxLength(48)
		]),
		cover: this.formBuilder.control(null, []),
		description: this.formBuilder.control(null, [
			Validators.required,
			Validators.minLength(16),
			Validators.maxLength(192)
		]),
		categoryId: this.formBuilder.control(null, [Validators.required]),
		categoryName: this.formBuilder.nonNullable.control('', [Validators.required]),
		markdown: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(64),
			Validators.maxLength(8192)
		])
	});
	postFormStage: string = 'Submit';
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
	postFormTextareaMarkdownItCropperToggle$: Subscription | undefined;
	postFormTextareaMarkdownItCropperClipboard$: Subscription | undefined;

	postFormTextareaMonospace: boolean = false;
	postFormPreviewId: string = 'postFormPreview';
	postFormFullscreenId: string = 'postFormFullscreen';

	fullscreenToggle: boolean = false;
	fullscreenClassList: string[] = ['border', 'border-base-content/20', 'rounded-box', 'shadow-xl'];
	fullscreenScrollSync: boolean = false;
	fullscreenTextWrapping: boolean = false;
	fullscreenMarkdown: boolean = false;
	fullscreenRender: boolean = false;

	// Lazy loading

	appCropperComponent: ComponentRef<CropperComponent>;
	appCategoryCreateComponent: ComponentRef<CategoryCreateComponent>;
	appPostPreviewComponent: ComponentRef<PostPreviewComponent>;
	appPostDeleteComponent: ComponentRef<PostDeleteComponent>;
	appPostDraftComponent: ComponentRef<PostDraftComponent>;

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply appearance settings */

		this.setAppearance();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngAfterViewInit(): void {
		/** Load cropper component by click in markdown control */

		this.postFormTextareaMarkdownItCropperToggle$?.unsubscribe();
		this.postFormTextareaMarkdownItCropperToggle$ = this.busService.markdownItCropperToggle
			.pipe(filter((toggle: boolean) => toggle))
			.subscribe({
				next: () => this.onToggleCropperDialog(true, true),
				error: (error: any) => console.error(error)
			});

		/** Load cropper component by click in textarea (for manage clipboard image paste) */

		const event$: Observable<Event> = fromEvent(this.document.getElementById(this.postFormTextareaId), 'click');

		this.postFormTextareaMarkdownItCropperClipboard$?.unsubscribe();
		this.postFormTextareaMarkdownItCropperClipboard$ = event$.subscribe({
			next: () => this.onToggleCropperDialog(false),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// ngOnDestroy

		[
			this.categoryListRequest$,
			this.postRequest$,
			this.postFormRequest$,
			this.postFormImageRequest$,
			this.postFormIsPristine$,
			this.postFormTextareaMarkdownItCropperToggle$,
			this.postFormTextareaMarkdownItCropperClipboard$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	ngOnCurrentUserIsReady(): void {
		/** Apply Data */

		this.setSkeleton();
		this.setResolver();
	}

	setSkeleton(): void {
		// Set categoryList

		this.categoryList = this.skeletonService.getCategoryList();
		this.categoryListSkeletonToggle = true;

		// Set category

		this.category = this.skeletonService.getCategory();
		this.categorySkeletonToggle = true;

		// Set post (when update post)

		const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));

		if (postId) {
			this.post = this.skeletonService.getPost();
			this.postSkeletonToggle = true;
		}
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			const categoryGetAllDto: CategoryGetAllDto = {
				page: 1,
				size: 100,
				username: this.currentUser.displayName
			};

			// Get categories

			this.categoryListRequest$?.unsubscribe();
			this.categoryListRequest$ = this.categoryService.getAll(categoryGetAllDto).subscribe({
				next: (categoryList: Category[]) => {
					this.categoryList = categoryList;
					this.categoryListSkeletonToggle = false;

					/** Apply target */

					this.setTarget();
				},
				error: (error: any) => console.error(error)
			});

			// Get post
			// prettier-ignore
			const postType: PostType = String(this.activatedRoute.snapshot.queryParamMap.get('postType') || 'category') as PostType;
			const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));

			if (postId && postType) {
				const postGetOneDto: PostGetOneDto = {
					userFirebaseUid: this.currentUser.uid
				};

				const postTypeMap: Record<PostType, Observable<Post>> = {
					category: this.postService.getOne(postId, postGetOneDto),
					password: this.postPasswordService.getOne(postId),
					private: this.postPrivateService.getOne(postId)
				};

				// Set postType

				this.onChangePostType(postType);

				// Set postTypeOriginal for detect changing

				this.postTypeOriginal = postType;

				// Request

				this.postRequest$?.unsubscribe();
				this.postRequest$ = postTypeMap[this.postType]
					.pipe(
						catchError((httpErrorResponse: HttpErrorResponse) => {
							const redirect$: Promise<boolean> = this.router.navigate(['/error', httpErrorResponse.status], {
								skipLocationChange: true
							});

							return from(redirect$).pipe(switchMap(() => throwError(() => httpErrorResponse)));
						})
					)
					.subscribe({
						next: (post: Post) => {
							this.post = post;
							this.postSkeletonToggle = false;

							this.category = this.post?.category || undefined;
							this.categorySkeletonToggle = false;

							this.postForm.patchValue({
								...this.post,
								categoryId: this.category?.id,
								categoryName: this.category?.name
							});
							this.postForm.markAllAsTouched();

							// Get postFormIsPristine

							this.postFormIsPristine$?.unsubscribe();
							this.postFormIsPristine$ = this.postForm.valueChanges.pipe(startWith(this.postForm.value)).subscribe({
								next: (value: any) => {
									const postTypeIsPristine: boolean = this.postTypeOriginal === this.postType;
									const postFormIsPristine: boolean = Object.keys(value).every((key: string) => {
										switch (key) {
											case 'categoryId':
												return (value[key] || null) === this.post.category?.id;
											case 'categoryName':
												return (value[key] || null) === this.post.category?.name;
											default:
												return (value[key] || null) === this.post[key as keyof Post];
										}
									});

									this.postFormIsPristine = this.post ? postTypeIsPristine && postFormIsPristine : postFormIsPristine;
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

				this.onTogglePostDraftDialog(true).catch((error: any) => console.error(error));
			}
		}
	}

	/** Extra */

	setAppearance(): void {
		this.postFormTextareaMonospace = !!Number(this.cookiesService.getItem('markdown-monospace'));
	}

	setMetaTags(): void {
		const title: string = 'Create and Share Your Ideas';

		// prettier-ignore
		const description: string = 'Unleash your creativity today by starting a new journey with a post. Share your thoughts, engage with others, and become a vital part of the Takabase community. Start posting and interacting now';

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

	setTarget(): void {
		const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));

		// Set only if there is no post to update

		if (!postId) {
			Object.entries(this.activatedRoute.snapshot.queryParams).forEach(([key, value]: string[]) => {
				switch (key) {
					case 'categoryId': {
						const category: Category = this.categoryList.find((category: Category) => category.id === Number(value));

						if (category) {
							this.onSelectCategory(category);
						}

						break;
					}
					case 'categoryName': {
						this.onToggleCategoryCreateDialog()
							.then(() => this.appCategoryCreateComponent.instance.categoryForm.get('name').setValue(value))
							.catch((error: any) => console.error(error));

						break;
					}
					case 'url':
					case 'text': {
						const abstractControl: AbstractControl | null = this.postForm.get('markdown');

						abstractControl.patchValue(value + '\n\n' + abstractControl.value);
						abstractControl.markAsTouched();

						break;
					}
					case 'query':
					case 'title': {
						const abstractControl: AbstractControl | null = this.postForm.get('name');

						abstractControl.setValue(value);
						abstractControl.markAsTouched();

						break;
					}
					case 'postType': {
						this.onChangePostType(value as PostType);

						break;
					}
				}
			});
		}
	}

	/** Category */

	onToggleCategory(toggle: boolean): void {
		if (this.categoryList.length) {
			if (!toggle) {
				this.postForm.get('categoryName').markAsTouched();
			}
		}
	}

	onCreateCategory(categoryCreate: Category): void {
		this.categoryList.unshift(categoryCreate);

		this.onSelectCategory(categoryCreate);
	}

	onSelectCategory(categorySelect: Category): void {
		this.category = categorySelect;

		this.postForm.patchValue({
			categoryId: this.category.id,
			categoryName: this.category.name
		});

		this.postForm.get('categoryId').markAsTouched();
		this.postForm.get('categoryName').markAsTouched();
	}

	/** Image Cropper */

	onUpdateCropperImage(fileUrl: string | null): void {
		this.postForm.get('cover').setValue(fileUrl, { emitEvent: true });
		this.postFormImageIsSubmitted.set(false);
	}

	onSubmitCropperImage(file: File): void {
		this.postForm.get('cover').setValue(null, { emitEvent: false });
		this.postFormImageIsSubmitted.set(true);

		this.postFormImageRequest$?.unsubscribe();
		this.postFormImageRequest$ = this.sharpService
			.create(file)
			.pipe(map((fileUrl: string) => this.sharpService.getFileUrlClean(fileUrl)))
			.subscribe({
				next: (fileUrl: string) => this.onUpdateCropperImage(fileUrl),
				error: () => this.postFormImageIsSubmitted.set(false)
			});
	}

	/** Fullscreen */

	onFullscreen(toggle: boolean): void {
		this.fullscreenToggle = toggle;

		// prettier-ignore
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

		// Force dispatch input event for re-render markdown in preview element

		this.document.getElementById(this.postFormTextareaId)?.dispatchEvent(new Event('input'));
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

	onChangePostType(postType: PostType): void {
		if (this.postType !== postType) {
			this.postType = postType;

			const formControlsRemove = (): void => {
				if (this.postType === 'password' || this.postType === 'private') {
					this.postForm.removeControl('categoryId');
					this.postForm.removeControl('categoryName');
				}

				if (this.postType === 'private' || this.postType === 'category') {
					this.postForm.removeControl('password');
				}
			};

			const formControlsModify = (): void => {
				const postFormDescriptionValidators: ValidatorFn[] = [Validators.minLength(16), Validators.maxLength(192)];

				if (this.postType === 'password' || this.postType === 'private') {
					this.postForm.get('description').setValidators(postFormDescriptionValidators);
				} else {
					this.postForm.get('description').setValidators([Validators.required, ...postFormDescriptionValidators]);
					this.postForm.get('description').markAsUntouched();
				}
			};

			const formControlsAppend = (): void => {
				if (this.postType === 'password') {
					// prettier-ignore
					this.postForm.addControl('password', this.formBuilder.nonNullable.control('', [
						Validators.required,
						Validators.minLength(6),
						Validators.maxLength(48),
						Validators.pattern(this.helperService.getRegex('password'))
					]));
				}

				if (this.postType === 'category') {
					this.postForm.addControl('categoryId', this.formBuilder.control('', [Validators.required]));
					this.postForm.addControl('categoryName', this.formBuilder.nonNullable.control('', []));
				}
			};

			const formControls = (): void => {
				if (this.post) {
					const postPassword: string = String(this.post.password || '');
					const postCategoryId: number | null = this.post.category?.id || null;
					const postCategoryName: string = String(this.post.category?.name || '');

					if (this.postType === 'password') {
						if (postPassword) {
							this.postForm.get('password').setValue(postPassword);
						}
					}

					if (this.postType === 'category') {
						if (postCategoryId && postCategoryName) {
							this.postForm.get('categoryId').setValue(postCategoryId);
							this.postForm.get('categoryName').setValue(postCategoryName);
						}
					}
				} else {
					this.onTogglePostDraftDialog(false).catch((error: any) => console.error(error));
				}
			};

			// Update postForm

			formControlsRemove();
			formControlsModify();
			formControlsAppend();
			formControls();

			Object.keys(this.postForm.controls)
				.filter((control: string) => this.postForm.get(control).value)
				.forEach((control: string) => this.postForm.get(control).markAsTouched());
		}
	}

	onSubmitPostFormDraft(value: any): void {
		this.onChangePostType(value.postType);

		switch (value.postType) {
			case 'password':
			case 'private': {
				break;
			}
			case 'category': {
				const category: Category = this.categoryList.find((category: Category) => {
					return category.id === value.postForm.categoryId;
				});

				if (category) {
					this.onSelectCategory(category);
				}

				// Avoid duplicating

				delete value.postForm.categoryId;
				delete value.postForm.categoryName;

				break;
			}
			default: {
				throw new Error('Invalid post type specified: ' + this.postType);
			}
		}

		this.postForm.patchValue(value.postForm);

		// Update postForm

		Object.keys(this.postForm.controls)
			.filter((control: string) => this.postForm.get(control).value)
			.forEach((control: string) => this.postForm.get(control).markAsTouched());
	}

	onSubmitPostForm(redirect: boolean = false): void {
		if (this.helperService.getFormValidation(this.postForm)) {
			this.postForm.disable();
			this.postFormStage = 'Moderation';

			const aiModerateTextDto: AIModerateTextDto = {
				model: 'text-moderation-stable',
				input: this.aiService.setInput(this.postForm.value)
			};

			// Dto

			const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
			const postTypeIsPristine: boolean = this.postTypeOriginal === this.postType;
			const postDeleteDto: PostDeleteDto = {};
			const postDto: PostCreateDto & PostUpdateDto = {
				...this.postForm.value,
				cover: this.postForm.value.cover || null,
				description: this.postForm.value.description || null
			};

			// Maps

			const postTypeMap = (): Observable<Partial<Post>> => {
				const postService: Record<PostType, PostPasswordService | PostPrivateService | PostService> = {
					category: this.postService,
					password: this.postPasswordService,
					private: this.postPrivateService
				};

				if (postId) {
					if (postTypeIsPristine) {
						return postService[this.postType].update(postId, postDto);
					} else {
						return postService[this.postType]
							.create(postDto)
							.pipe(switchMap(() => postService[this.postTypeOriginal].delete(postId, postDeleteDto)));
					}
				} else {
					return postService[this.postType].create(postDto);
				}
			};

			this.postFormRequest$?.unsubscribe();
			this.postFormRequest$ = this.aiService
				.moderateText(aiModerateTextDto)
				.pipe(
					tap(() => (this.postFormStage = this.postType === 'category' ? 'Publication' : 'Saving')),
					switchMap(() => postTypeMap())
				)
				.subscribe({
					next: () => {
						this.snackbarService.success('Cheers!', 'Post has been ' + (postId ? 'updated' : 'saved'));

						// Start only if there is no post to update

						if (!this.post) {
							if (this.platformService.isBrowser()) {
								const window: Window = this.platformService.getWindow();

								Object.keys(window.localStorage)
									.filter((key: string) => key.startsWith('draft'))
									.forEach((key: string) => this.localStorageService.removeItem(key));

								this.post = postDto as any;

								// Unsubscribe postForm.valueChanges

								this.appPostDraftComponent.destroy();
								this.appPostDraftComponent.changeDetectorRef.detectChanges();
							}
						}

						// prettier-ignore
						if (redirect) {
							this.router
								.navigate(['/', this.currentUser.displayName, this.postType, String(postDto.categoryId || '')].filter((command: string) => !!command))
								.catch((error: any) => this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error));
						}

						// Remove disable

						this.postForm.enable();
					},
					error: () => {
						this.postForm.enable();
						this.postFormStage = 'Submit';
					}
				});
		}
	}

	/** LAZY */

	async onToggleCropperDialog(toggle: boolean, markdownItToggle: boolean = false): Promise<void> {
		if (!this.appCropperComponent) {
			await import('../standalone/components/cropper/cropper.component').then(m => {
				this.appCropperComponent = this.viewContainerRef.createComponent(m.CropperComponent);
				this.appCropperComponent.instance.appCropperSubmit.subscribe({
					next: (file: File) => this.onSubmitCropperImage(file),
					error: (error: any) => console.error(error)
				});
			});
		}

		this.appCropperComponent.changeDetectorRef.detectChanges();
		this.appCropperComponent.instance.onToggleCropperDialog(toggle, markdownItToggle);
	}

	async onToggleCategoryCreateDialog(): Promise<void> {
		if (!this.appCategoryCreateComponent) {
			await import('../standalone/components/category/create/create.component').then(m => {
				this.appCategoryCreateComponent = this.viewContainerRef.createComponent(m.CategoryCreateComponent);
				this.appCategoryCreateComponent.instance.appCategoryCreateSuccess.subscribe({
					next: (category: Category) => this.onCreateCategory(category),
					error: (error: any) => console.error(error)
				});
			});
		}

		this.appCategoryCreateComponent.changeDetectorRef.detectChanges();
		this.appCategoryCreateComponent.instance.onToggleCategoryCreateDialog(true);
	}

	async onTogglePostPreviewDialog(): Promise<void> {
		if (!this.appPostPreviewComponent) {
			await import('../standalone/components/post/preview/preview.component')
				.then(m => (this.appPostPreviewComponent = this.viewContainerRef.createComponent(m.PostPreviewComponent)))
				.catch((error: any) => console.error(error));
		}

		this.appPostPreviewComponent.setInput('appPostPreviewPost', this.postForm.value);
		this.appPostPreviewComponent.setInput('appPostPreviewPostType', this.postType);
		this.appPostPreviewComponent.setInput('appPostPreviewCategory', this.category);

		this.appPostPreviewComponent.changeDetectorRef.detectChanges();
		this.appPostPreviewComponent.instance.onTogglePostPreviewDialog(true);
	}

	async onTogglePostDeleteDialog(): Promise<void> {
		if (!this.appPostDeleteComponent) {
			await import('../standalone/components/post/delete/delete.component')
				.then(m => (this.appPostDeleteComponent = this.viewContainerRef.createComponent(m.PostDeleteComponent)))
				.catch((error: any) => console.error(error));
		}

		this.appPostDeleteComponent.setInput('appPostDeletePost', this.post);
		this.appPostDeleteComponent.setInput('appPostDeletePostType', this.postType);

		this.appPostDeleteComponent.changeDetectorRef.detectChanges();
		this.appPostDeleteComponent.instance.onTogglePostDeleteDialog(true);
	}

	async onTogglePostDraftDialog(toggle: boolean): Promise<void> {
		if (!this.appPostDraftComponent) {
			await import('../standalone/components/post/draft/draft.component')
				.then(m => {
					this.appPostDraftComponent = this.viewContainerRef.createComponent(m.PostDraftComponent);
					this.appPostDraftComponent.instance.appPostDraftSuccess.subscribe({
						next: (value: any) => this.onSubmitPostFormDraft(value),
						error: (error: any) => console.error(error)
					});
				})
				.catch((error: any) => console.error(error));
		}

		this.appPostDraftComponent.setInput('appPostDraftPostType', this.postType);
		this.appPostDraftComponent.setInput('appPostDraftPostForm', this.postForm);

		this.appPostDraftComponent.changeDetectorRef.detectChanges();
		this.appPostDraftComponent.instance.onTogglePostDraftDialog(toggle);
	}
}
