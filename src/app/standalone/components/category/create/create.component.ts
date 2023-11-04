/** @format */

import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { AppInputTrimWhitespaceDirective } from '../../../directives/app-input-trim-whitespace.directive';
import { AppTextareaResizeDirective } from '../../../directives/app-textarea-resize.directive';
import { CategoryCreateDto } from '../../../../core/dto/category/category-create.dto';
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

interface CategoryForm {
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
	selector: 'app-category-create, [appCategoryCreate]',
	templateUrl: './create.component.html'
})
export class CategoryCreateComponent {
	// prettier-ignore
	@ViewChild('categoryCreateDialogElement') categoryCreateDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appCategoryCreateToggle: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() appCategoryCreateSuccess: EventEmitter<Category> = new EventEmitter<Category>();

	categoryForm: FormGroup | undefined;
	categoryCreateDialogToggle: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private categoryService: CategoryService,
		private snackbarService: SnackbarService
	) {
		this.categoryForm = this.formBuilder.group<CategoryForm>({
			name: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(36)
			]),
			description: this.formBuilder.control(null, [Validators.maxLength(255)])
		});
	}

	onToggleCategoryCreateDialog(toggle: boolean): void {
		this.appCategoryCreateToggle.emit(toggle);

		this.categoryCreateDialogToggle = toggle;

		if (toggle) {
			this.categoryCreateDialogElement.nativeElement.showModal();
		} else {
			this.categoryCreateDialogElement.nativeElement.close();
		}

		this.categoryForm.reset();
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

					this.appCategoryCreateSuccess.emit(category);

					this.categoryForm.enable();

					this.onToggleCategoryCreateDialog(false);
				},
				error: () => this.categoryForm.enable()
			});
		}
	}
}
