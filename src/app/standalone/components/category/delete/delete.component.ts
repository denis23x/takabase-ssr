/** @format */

import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { AppInputTrimWhitespaceDirective } from '../../../directives/app-input-trim-whitespace.directive';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CategoryService } from '../../../../core/services/category.service';
import { Subscription } from 'rxjs';
import { Post } from '../../../../core/models/post.model';
import { CategoryDeleteDto } from '../../../../core/dto/category/category-delete.dto';
import { PostGetAllDto } from '../../../../core/dto/post/post-get-all.dto';
import { filter } from 'rxjs/operators';
import { Category } from '../../../../core/models/category.model';
import { PostService } from '../../../../core/services/post.service';
import { FileService } from '../../../../core/services/file.service';
import { HelperService } from '../../../../core/services/helper.service';
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
		ReactiveFormsModule
	],
	selector: 'app-category-delete, [appCategoryDelete]',
	templateUrl: './delete.component.html'
})
export class CategoryDeleteComponent implements OnInit, OnDestroy {
	// prettier-ignore
	@ViewChild('categoryDeleteDialogElement') categoryDeleteDialogElement: ElementRef<HTMLDialogElement> | undefined;

	// prettier-ignore
	@Output() appCategoryDeleteSuccess: EventEmitter<Category & CategoryDeleteDto> = new EventEmitter<Category & CategoryDeleteDto>();

	@Input({ required: true })
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

	postList: Post[] = [];
	postListRequest$: Subscription | undefined;

	categoryDeleteForm: FormGroup | undefined;
	categoryDeleteFormRequest$: Subscription | undefined;

	constructor(
		private formBuilder: FormBuilder,
		private categoryService: CategoryService,
		private snackbarService: SnackbarService,
		private helperService: HelperService,
		private postService: PostService,
		private fileService: FileService,
		private authorizationService: AuthorizationService
	) {
		this.categoryDeleteForm = this.formBuilder.group<CategoryDeleteForm>({
			name: this.formBuilder.nonNullable.control('', []),
			categoryId: this.formBuilder.control(null, [])
		});
	}

	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.currentUser$, this.categoryDeleteFormRequest$, this.postListRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleCategoryDeleteDialog(toggle: boolean): void {
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

			const abstractControl: AbstractControl = this.categoryDeleteForm.get('categoryId');

			// Move posts to another category

			if (abstractControl.value) {
				categoryDeleteDto.categoryId = abstractControl.value;
			}

			this.categoryDeleteFormRequest$?.unsubscribe();
			this.categoryDeleteFormRequest$ = this.categoryService
				.delete(categoryId, categoryDeleteDto)
				.subscribe({
					next: () => {
						this.snackbarService.success(null, 'Category deleted');

						this.appCategoryDeleteSuccess.emit({
							...this.category,
							...categoryDeleteDto
						});

						this.category = undefined;
						this.categoryList = this.categoryList.filter((category: Category) => {
							return category.id !== categoryId;
						});

						this.categoryDeleteForm.enable();

						this.onToggleCategoryDeleteDialog(false);

						// Delete post images

						if (!categoryDeleteDto.categoryId) {
							const postGetAllDto: PostGetAllDto = {
								categoryId
							};

							this.postListRequest$?.unsubscribe();
							this.postListRequest$ = this.postService
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
					},
					error: () => this.categoryDeleteForm.enable()
				});
		}
	}
}
