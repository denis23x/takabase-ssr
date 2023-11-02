/** @format */

import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnDestroy,
	Output,
	ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { AppInputTrimWhitespaceDirective } from '../../../directives/app-input-trim-whitespace.directive';
import { AppTextareaResizeDirective } from '../../../directives/app-textarea-resize.directive';
import { Category } from '../../../../core/models/category.model';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { HelperService } from '../../../../core/services/helper.service';
import { CategoryService } from '../../../../core/services/category.service';
import { CategoryUpdateDto } from '../../../../core/dto/category/category-update.dto';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

interface CategoryUpdateForm {
	name: FormControl<string>;
	description: FormControl<string | null>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		SvgIconComponent,
		WindowComponent,
		AppInputTrimWhitespaceDirective,
		AppTextareaResizeDirective,
		ReactiveFormsModule
	],
	selector: 'app-category-update, [appCategoryUpdate]',
	templateUrl: './update.component.html'
})
export class CategoryUpdateComponent implements OnDestroy {
	// prettier-ignore
	@ViewChild('categoryUpdateDialogElement') categoryUpdateDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appCategoryUpdateSuccess: EventEmitter<Category> = new EventEmitter<Category>();

	@Input()
	set appCategoryUpdateCategory(category: Category) {
		this.category = category;
	}

	@Input()
	set appCategoryUpdateCategoryList(categoryList: Category[]) {
		this.categoryList = categoryList;
	}

	category: Category | undefined;
	categoryList: Category[] = [];

	categoryUpdateForm: FormGroup | undefined;
	categoryUpdateFormIsPristine$: Subscription | undefined;
	categoryUpdateFormIsPristine: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private categoryService: CategoryService,
		private snackbarService: SnackbarService
	) {
		this.categoryUpdateForm = this.formBuilder.group<CategoryUpdateForm>({
			name: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(36)
			]),
			description: this.formBuilder.control(null, [Validators.maxLength(255)])
		});
	}

	ngOnDestroy(): void {
		[this.categoryUpdateFormIsPristine$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleCategoryUpdateForm(toggle: boolean): void {
		if (toggle) {
			this.categoryUpdateForm.patchValue(this.category);
			this.categoryUpdateForm.markAllAsTouched();
			this.categoryUpdateDialogElement.nativeElement.showModal();
			this.categoryUpdateFormIsPristine$ = this.categoryUpdateForm.valueChanges
				.pipe(startWith(this.categoryUpdateForm.value))
				.subscribe({
					next: (value: any) => {
						this.categoryUpdateFormIsPristine = Object.keys(value).every((key: string) => {
							return value[key] === this.category[key];
						});
					},
					error: (error: any) => console.error(error)
				});
		} else {
			this.categoryUpdateForm.reset();
			this.categoryUpdateDialogElement.nativeElement.close();
			this.categoryUpdateFormIsPristine = true;
			this.categoryUpdateFormIsPristine$?.unsubscribe();
		}
	}

	onSubmitCategoryUpdateForm(): void {
		if (this.helperService.getFormValidation(this.categoryUpdateForm)) {
			this.categoryUpdateForm.disable();

			const categoryId: number = this.category.id;
			const categoryUpdateDto: CategoryUpdateDto = {
				...this.categoryUpdateForm.value
			};

			this.categoryService.update(categoryId, categoryUpdateDto).subscribe({
				next: (category: Category) => {
					this.snackbarService.success(null, 'Category updated');

					this.appCategoryUpdateSuccess.emit(category);

					this.categoryUpdateForm.enable();

					this.onToggleCategoryUpdateForm(false);
				},
				error: () => this.categoryUpdateForm.enable()
			});
		}
	}
}
