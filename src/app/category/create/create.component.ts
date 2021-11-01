/** @format */

import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService, SnackbarService } from '../../core';
import { Category, CategoryService } from '../core';

@Component({
  selector: 'app-category-create',
  templateUrl: './create.component.html'
})
export class CategoryCreateComponent {
  createForm: FormGroup;
  createFormSubmitted: boolean;

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
      this.createFormSubmitted = true;

      this.categoryService.createOne(this.createForm.value).subscribe(
        (category: Category) => {
          this.onClose(category);
          this.snackbarService.success('Success', 'Category created');
        },
        () => (this.createFormSubmitted = false)
      );
    }
  }

  onClose(category?: Category): void {
    this.router
      .navigate(['../'], {
        relativeTo: this.activatedRoute.parent,
        queryParams: {
          categoryId: category ? category.id : this.activatedRoute.snapshot.queryParams.categoryId
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
