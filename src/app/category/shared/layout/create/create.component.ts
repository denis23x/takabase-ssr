/** @format */

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  HelperService,
  SnackbarService,
  CategoryService,
  CategoryCreateOneDto,
  Category
} from '../../../../core';

@Component({
  selector: 'app-category-create',
  templateUrl: './create.component.html'
})
export class CategoryCreateComponent implements OnInit {
  @Output() closed = new EventEmitter<Category | void>();

  createForm: FormGroup;
  createFormIsSubmitted: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private categoryService: CategoryService,
    private snackbarService: SnackbarService
  ) {
    this.createForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
      isPrivate: [false]
    });
  }

  ngOnInit(): void {}

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.createForm)) {
      this.createFormIsSubmitted = true;

      const categoryCreateOneDto: CategoryCreateOneDto = {
        ...this.createForm.value
      };

      this.categoryService.createOne(categoryCreateOneDto).subscribe(
        (category: Category) => {
          this.closed.emit(category);
          this.snackbarService.success('Success', 'Category created');
        },
        () => (this.createFormIsSubmitted = false)
      );
    }
  }
}
