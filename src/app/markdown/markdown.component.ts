/** @format */

import {
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import { PlatformService, HelperService, Post, Category } from '../core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { of, Subscription, switchMap } from 'rxjs';
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
	@ViewChild('categoryNameInput') categoryNameInput: ElementRef | undefined;

	activatedRouteData$: Subscription | undefined;

	categoryList: Category[] = [];

	postForm: FormGroup | undefined;
	postFormIsSubmitted: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private platformService: PlatformService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private helperService: HelperService
	) {
		this.postForm = this.formBuilder.group<PostForm>({
			title: this.formBuilder.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(36)
			]),
			description: this.formBuilder.control('', [Validators.required]),
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
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	onToggleCategory(toggle: boolean): void {
		const abstractControl: AbstractControl = this.postForm.get('categoryName');

		if (toggle) {
			this.categoryNameInput.nativeElement.focus();
		} else if (!abstractControl.value) {
			abstractControl.setErrors({ required: true });
		}
	}

	onChangeCategory(category: Category): void {
		this.postForm.patchValue({
			categoryId: category.id,
			categoryName: category.name
		});
	}

	onSubmitPostForm(): void {
		if (this.helperService.getFormValidation(this.postForm)) {
		}
	}

	// onSubmitPostForm(): void {
	//   if (this.helperService.getFormValidation(this.postForm)) {
	//     this.postFormIsSubmitted = true;
	//
	//     // prettier-ignore
	//     const postId: number = Number(this.activatedRoute.parent.snapshot.paramMap.get('postId'));
	//     const postCreateDto: PostCreateDto = {
	//       ...this.postForm.value
	//     };
	//
	//     // @ts-ignore
	//     delete postCreateDto.categoryName;
	//
	//     iif(
	//       () => !!postId,
	//       this.postService.update(postId, postCreateDto),
	//       this.postService.create(postCreateDto)
	//     ).subscribe({
	//       next: (post: Post) => {
	//         // prettier-ignore
	//         this.router
	//           .navigate(['/@' + post.user.name, 'category', post.category.id, 'posts', post.id])
	//           .then(() => this.snackbarService.success('Cheers!', 'Post saved'));
	//       },
	//       error: () => (this.postFormIsSubmitted = false)
	//     });
	//   }
	// }
}
