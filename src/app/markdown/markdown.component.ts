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
	FileCreateDto
} from '../core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { iif, of, Subscription, switchMap } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';

interface PostForm {
	title: FormControl<string>;
	image: FormControl<string>;
	description: FormControl<string>;
	categoryId: FormControl<number>;
	categoryName: FormControl<string>;
	body: FormControl<string>;
}

@Component({
	selector: 'app-markdown',
	templateUrl: './markdown.component.html'
})
export class MarkdownComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	category: Category | undefined;
	categoryList: Category[] = [];

	postForm: FormGroup | undefined;
	postFormIsSubmitted: boolean = false;

	post: Partial<Post> | undefined;
	postImage: boolean = false;
	postPreview: boolean = false;

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	constructor(
		private formBuilder: FormBuilder,
		private platformService: PlatformService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private helperService: HelperService,
		private postService: PostService,
		private snackbarService: SnackbarService,
		private authService: AuthService
	) {
		this.postForm = this.formBuilder.group<PostForm>({
			title: this.formBuilder.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(36)
			]),
			image: this.formBuilder.control('', []),
			description: this.formBuilder.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(255)
			]),
			categoryId: this.formBuilder.control(null, [Validators.required]),
			categoryName: this.formBuilder.control('', []),
			body: this.formBuilder.control('', [
				Validators.required,
				Validators.minLength(24),
				Validators.maxLength(7200)
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
					this.postForm.patchValue({
						...post,
						categoryId: post.category.id,
						categoryName: post.category.name
					});

					this.postForm.markAllAsTouched();
				},
				error: (error: any) => console.error(error)
			});

		this.authUser$ = this.authService.user.subscribe({
			next: (user: User) => (this.authUser = user),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$, this.authUser$].forEach($ => $?.unsubscribe());
	}

	onChangeImage(fileCreateDto?: FileCreateDto): void {
		this.postForm.get('image').setValue(fileCreateDto.path);
	}

	onToggleCategory(toggle: boolean): void {
		const abstractControl: AbstractControl = this.postForm.get('categoryName');

		if (!toggle && !abstractControl.value) {
			abstractControl.setErrors({ required: true });
		}
	}

	onChangeCategory(category: Category): void {
		this.category = category;

		this.postForm.patchValue({
			categoryId: category.id,
			categoryName: category.name
		});
	}

	onPreviewPost(toggle: boolean): void {
		const { categoryId, categoryName, ...postForm } = this.postForm.value;

		this.post = {
			...postForm,
			user: this.authUser,
			category: this.category
		};

		this.postPreview = toggle;
	}

	onSubmitPostForm(): void {
		if (this.helperService.getFormValidation(this.postForm)) {
			this.postFormIsSubmitted = true;

			// prettier-ignore
			const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
			const postCreateDto: PostCreateDto = {
				...this.postForm.value
			};

			// @ts-ignore
			delete postCreateDto.categoryName;

			iif(
				() => !!postId,
				this.postService.update(postId, postCreateDto),
				this.postService.create(postCreateDto)
			).subscribe({
				next: (post: Post) => {
					// prettier-ignore
					this.router
            .navigate(['/@' + post.user.name, 'category', post.category.id, 'posts', post.id])
            .then(() => this.snackbarService.success('Cheers!', 'Post has been saved'));
				},
				error: () => (this.postFormIsSubmitted = false)
			});
		}
	}
}
