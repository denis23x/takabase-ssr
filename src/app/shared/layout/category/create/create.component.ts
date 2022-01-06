/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import {
  AuthService,
  Category,
  CategoryService,
  HelperService,
  SnackbarService,
  User
} from '../../../../core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-create',
  templateUrl: './create.component.html'
})
export class CategoryCreateComponent implements OnInit, OnDestroy {
  categoryForm: FormGroup;
  categoryFormIsSubmitted: boolean;

  user: User;
  user$: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private categoryService: CategoryService,
    private snackbarService: SnackbarService,
    private location: Location,
    private authService: AuthService
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]]
    });
  }

  ngOnInit(): void {
    this.user$ = this.authService.userSubject.subscribe((user: User) => (this.user = user));
  }

  onSubmitCategoryForm(): void {
    if (this.helperService.getFormValidation(this.categoryForm)) {
      this.categoryFormIsSubmitted = true;

      this.categoryService.createOne(this.categoryForm.value).subscribe(
        (category: Category) => {
          this.authService.userSubject.next({
            ...this.user,
            categories: [category].concat(this.user.categories)
          });

          this.snackbarService.success('Success', 'Category created');

          this.onClose();
        },
        () => (this.categoryFormIsSubmitted = false)
      );
    }
  }

  ngOnDestroy(): void {
    [this.user$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onClose(): void {
    this.location.back();
  }
}
