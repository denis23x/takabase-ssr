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

  isSubmitting: boolean;

  constructor(
    private route: ActivatedRoute,
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
      this.isSubmitting = true;

      this.categoryService.create(this.createForm.value).subscribe(
        (category: Category) => {
          this.snackbarService.success('Success', 'Category created!');
          this.onClose(category);
        },
        () => (this.isSubmitting = false)
      );
    }
  }

  onClose(category?: Category): void {
    this.router
      .navigate(['.'], {
        relativeTo: this.route.parent,
        queryParamsHandling: 'preserve',
        state: {
          ...category
        }
      })
      .then(() => this.createForm.reset());
  }
}
