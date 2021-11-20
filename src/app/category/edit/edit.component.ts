/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService, SnackbarService, Category, CategoryService } from '../../core';
import { Subscription } from 'rxjs';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-category-edit',
  templateUrl: './edit.component.html'
})
export class CategoryEditComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  editForm: FormGroup;
  editFormIsSubmitted: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private categoryService: CategoryService,
    private snackbarService: SnackbarService
  ) {
    this.editForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
      isPrivate: [false]
    });
  }

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((category: Category) => this.editForm.patchValue(category));
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmit(): void {
    if (this.helperService.getFormValidation(this.editForm)) {
      this.editFormIsSubmitted = true;

      const id = Number(this.activatedRoute.snapshot.queryParams.categoryId);

      this.categoryService.updateOne(id, this.editForm.value).subscribe(
        (category: Category) => {
          this.onClose(category);
          this.snackbarService.success('Success', 'Category updated!');
        },
        () => (this.editFormIsSubmitted = false)
      );
    }
  }

  onClose(category?: Category): void {
    this.router
      .navigate(['../'], {
        relativeTo: this.activatedRoute.parent,
        queryParamsHandling: 'preserve',
        state: {
          action: 'update',
          category
        }
      })
      .then(() => console.debug('Route was changed'));
  }
}
