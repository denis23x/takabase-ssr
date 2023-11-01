/** @format */

import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { AppInputTrimWhitespaceDirective } from '../../../directives/app-input-trim-whitespace.directive';
import { AppTextareaResizeDirective } from '../../../directives/app-textarea-resize.directive';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CategoryService } from '../../../../core/services/category.service';
import { AppScrollPresetDirective } from '../../../directives/app-scroll-preset.directive';
import { Subscription } from 'rxjs';
import { Post } from '../../../../core/models/post.model';
import { CategoryDeleteDto } from '../../../../core/dto/category/category-delete.dto';
import { PostGetAllDto } from '../../../../core/dto/post/post-get-all.dto';
import { filter } from 'rxjs/operators';
import { Category } from '../../../../core/models/category.model';
import { PostService } from '../../../../core/services/post.service';
import { FileService } from '../../../../core/services/file.service';
import { HelperService } from '../../../../core/services/helper.service';
import { UserService } from '../../../../core/services/user.service';
import { Router } from '@angular/router';
import { CurrentUser } from '../../../../core/models/current-user.model';
import { AuthorizationService } from '../../../../core/services/authorization.service';

interface CategoryDeleteForm {
	name: FormControl<string>;
	categoryId: FormControl<number>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		SvgIconComponent,
		WindowComponent,
		AppInputTrimWhitespaceDirective,
		AppTextareaResizeDirective,
		ReactiveFormsModule,
		AppScrollPresetDirective
	],
	selector: 'app-category-delete, [appCategoryDelete]',
	templateUrl: './delete.component.html'
})
export class CategoryDeleteComponent implements OnInit, OnDestroy {
	// prettier-ignore
	@ViewChild('categoryDeleteDialogElement') categoryDeleteDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Input()
	set appCategoryDeleteCategory(category: Category) {
		this.category = category;
	}

	@Input()
	set appCategoryDeleteCategoryList(categoryList: Category[]) {
		this.categoryList = categoryList;
	}

	@Input()
	set appCategoryDeletePostList(postList: Post[]) {
		this.postList = postList;
	}

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	category: Category | undefined;
	categoryList: Category[] = [];

	categoryDeleteForm: FormGroup | undefined;
	categoryDeleteForm$: Subscription | undefined;

	postList: Post[] = [];

	constructor(
		private formBuilder: FormBuilder,
		private categoryService: CategoryService,
		private snackbarService: SnackbarService,
		private helperService: HelperService,
		private postService: PostService,
		private userService: UserService,
		private router: Router,
		private fileService: FileService,
		private authorizationService: AuthorizationService
	) {
		this.categoryDeleteForm = this.formBuilder.group<CategoryDeleteForm>({
			name: this.formBuilder.nonNullable.control('', []),
			categoryId: this.formBuilder.control(null, [])
		});
	}

	ngOnInit(): void {
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.currentUser$, this.categoryDeleteForm$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleCategoryDeleteForm(toggle: boolean): void {
		if (toggle) {
			this.categoryDeleteForm.reset();
			this.categoryDeleteDialogElement.nativeElement.showModal();

			const abstractControl: AbstractControl = this.categoryDeleteForm.get('name');

			abstractControl.setValidators([
				Validators.required,
				Validators.pattern(this.helperService.getRegex('exact', this.category.name))
			]);

			abstractControl.updateValueAndValidity();
		} else {
			this.categoryDeleteForm.reset();
			this.categoryDeleteDialogElement.nativeElement.close();
		}
	}

	onSubmitCategoryDeleteForm(): void {
		if (this.helperService.getFormValidation(this.categoryDeleteForm)) {
			this.categoryDeleteForm.disable();

			const categoryId: number = this.category.id;
			const categoryDeleteDto: CategoryDeleteDto = {};
			const categoryDeleteRedirect: string[] = [this.userService.getUserUrl(this.currentUser)];

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
}
