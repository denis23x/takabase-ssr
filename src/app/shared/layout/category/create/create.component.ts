/** @format */

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  Category,
  CategoryCreateOneDto,
  CategoryService,
  HelperService,
  SnackbarService
} from '../../../../core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-category-create',
  templateUrl: './create.component.html'
})
export class CategoryCreateComponent implements OnInit {
  @Output() closed = new EventEmitter<boolean>();
  @Output() submitted = new EventEmitter<Category>();

  categoryForm: FormGroup;
  categoryFormIsSubmitted: boolean;

  constructor(
    private formBuilder: FormBuilder,
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

      const categoryCreateOneDto: CategoryCreateOneDto = {
        ...this.categoryForm.value
      };

      this.categoryService.createOne(categoryCreateOneDto).subscribe(
        (category: Category) => {
          this.submitted.emit(category);
          this.snackbarService.success('Category created', {
            title: 'Cheers!'
          });
        },
        () => (this.categoryFormIsSubmitted = false)
      );
    }
  }
}
