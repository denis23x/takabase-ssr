/** @format */

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService, SnackbarService, Category, CategoryService } from '../../../../core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-delete',
  templateUrl: './delete.component.html'
})
export class CategoryDeleteComponent implements OnInit, OnDestroy {
  @Output() closed = new EventEmitter<Category | void>();

  @Input()
  set appCategory(category: Category) {
    this.category = category;

    this.deleteForm.patchValue(this.category);
    this.deleteForm.get('name').clearValidators();
    this.deleteForm
      .get('name')
      .setValidators([
        Validators.required,
        Validators.pattern(new RegExp('^' + this.category.name + '$'))
      ]);
  }

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
      id: [null, [Validators.required]],
      name: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.deleteForm)) {
      this.deleteFormIsSubmitted = true;

      const { id } = this.deleteForm.value;

      this.categoryService.deleteOne(id).subscribe(
        (category: Category) => {
          this.closed.emit(category);
          this.snackbarService.success('Success', 'Category deleted!');
        },
        () => (this.deleteFormIsSubmitted = false)
      );
    }
  }
}
