/** @format */

import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  HelperService,
  SnackbarService,
  Category,
  CategoryService,
  CategoryCreateOneDto
} from '../../core';

@Component({
  selector: 'app-category-create',
  templateUrl: './create.component.html'
})
export class CategoryCreateComponent {
  createForm: FormGroup;
  createFormIsSubmitted: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
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

  onSubmit(): void {
    if (this.helperService.getFormValidation(this.createForm)) {
      this.createFormIsSubmitted = true;

      const categoryCreateOneDto: CategoryCreateOneDto = {
        ...this.createForm.value
      };

      this.categoryService.createOne(categoryCreateOneDto).subscribe(
        (category: Category) => {
          this.onClose(category);
          this.snackbarService.success('Success', 'Category created');
        },
        () => (this.createFormIsSubmitted = false)
      );
    }
  }

  onClose(category?: Category): void {
    this.router
      .navigate(['../'], {
        relativeTo: this.activatedRoute.parent,
        queryParams: {
          categoryId: category
            ? category.id
            : this.activatedRoute.snapshot.queryParamMap.get('categoryId')
        },
        queryParamsHandling: 'merge',
        state: {
          action: 'create',
          category
        }
      })
      .then(() => console.debug('Route was changed'));
  }
}
