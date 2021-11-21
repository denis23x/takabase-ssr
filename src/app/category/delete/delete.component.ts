/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService, SnackbarService, Category, CategoryService } from '../../core';
import { Subscription } from 'rxjs';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-category-delete',
  templateUrl: './delete.component.html'
})
export class CategoryDeleteComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  deleteForm: FormGroup;
  deleteFormIsSubmitted: boolean;

  category: Category;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private categoryService: CategoryService,
    private snackbarService: SnackbarService
  ) {
    this.deleteForm = this.formBuilder.group({
      name: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((category: Category) => {
        this.category = category;

        this.deleteForm.get('name').clearValidators();
        this.deleteForm
          .get('name')
          .setValidators([
            Validators.required,
            Validators.pattern(new RegExp('^' + this.category.name + '$'))
          ]);
      });
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmit(): void {
    if (this.helperService.getFormValidation(this.deleteForm)) {
      this.deleteFormIsSubmitted = true;

      const categoryId: number = Number(
        this.activatedRoute.snapshot.queryParamMap.get('categoryId')
      );

      this.categoryService.deleteOne(categoryId).subscribe(
        (category: Category) => {
          this.onClose(category);
          this.snackbarService.success('Success', 'Category deleted!');
        },
        () => (this.deleteFormIsSubmitted = false)
      );
    }
  }

  onClose(category?: Category): void {
    this.router
      .navigate(['../'], {
        relativeTo: this.activatedRoute.parent,
        queryParams: {
          categoryId: category ? null : this.activatedRoute.snapshot.queryParamMap.get('categoryId')
        },
        queryParamsHandling: 'merge',
        state: {
          action: 'delete',
          category
        }
      })
      .then(() => console.debug('Route was changed'));
  }
}
