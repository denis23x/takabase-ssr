/** @format */

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
	Category,
	CategoryCreateDto,
	CategoryService,
	HelperService,
	SnackbarService
} from '../../../../core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';

interface CategoryForm {
	name: FormControl<string>;
}

@Component({
	selector: 'app-category-create',
	templateUrl: './create.component.html'
})
export class CategoryCreateComponent implements OnInit {
	@Output() closed: EventEmitter<boolean> = new EventEmitter<boolean>();
	@Output() submitted: EventEmitter<Category> = new EventEmitter<Category>();

	categoryForm: FormGroup | undefined;
	categoryFormIsSubmitted: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private categoryService: CategoryService,
		private snackbarService: SnackbarService
	) {
		this.categoryForm = this.formBuilder.group<CategoryForm>({
			name: this.formBuilder.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(24)
			])
		});
	}

	ngOnInit(): void {}

	onSubmitCategoryForm(): void {
		if (this.helperService.getFormValidation(this.categoryForm)) {
			this.categoryFormIsSubmitted = true;

			const categoryCreateDto: CategoryCreateDto = {
				...this.categoryForm.value
			};

			this.categoryService.create(categoryCreateDto).subscribe({
				next: (category: Category) => {
					this.submitted.emit(category);

					this.snackbarService.success('Cheers!', 'Category created');

					this.categoryFormIsSubmitted = false;
				},
				error: () => (this.categoryFormIsSubmitted = false)
			});
		}
	}
}
