/** @format */

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  Category,
  CategoryCreateDto,
  CategoryService,
  HelperService,
  SnackbarService
} from '../../../../core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-category-create',
  templateUrl: './create.component.html'
})
export class CategoryCreateComponent implements OnInit {
  @Output() closed = new EventEmitter<boolean>();
  @Output() submitted = new EventEmitter<Category>();

  categoryForm: UntypedFormGroup;
  categoryFormIsSubmitted: boolean;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private helperService: HelperService,
    private categoryService: CategoryService,
    private snackbarService: SnackbarService
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]]
    });
  }

  ngOnInit(): void {}

  onSubmitCategoryForm(): void {
    if (this.helperService.getFormValidation(this.categoryForm)) {
      this.categoryFormIsSubmitted = true;

      const categoryCreateDto: CategoryCreateDto = {
        ...this.categoryForm.value
      };

      this.categoryService.create(categoryCreateDto).subscribe(
        (category: Category) => {
          this.submitted.emit(category);

          this.snackbarService.success('Category created', {
            title: 'Cheers!'
          });

          this.categoryFormIsSubmitted = false;
        },
        () => (this.categoryFormIsSubmitted = false)
      );
    }
  }
}
