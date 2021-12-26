/** @format */

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Category,
  CategoryExtras,
  CategoryHandlerDto,
  CategoryService,
  HelperService,
  SnackbarService
} from '../../../../core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-save',
  templateUrl: './save.component.html'
})
export class CategorySaveComponent implements OnInit, OnDestroy {
  @Output() submitted = new EventEmitter<any>();

  @Input()
  set appCategory(category: Category) {
    this.category = category;
  }

  routeData$: Subscription;

  category: Category;
  categoryForm: FormGroup;
  categoryFormIsSubmitted: boolean;
  categoryFormToggleDelete: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private categoryService: CategoryService,
    private snackbarService: SnackbarService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]]
    });
  }

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(
        pluck('data'),
        filter((category: Category) => !!category)
      )
      .subscribe((category: Category) => {
        this.category = category;
        this.categoryForm.get('name').setValue(this.category.name);
      });
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.categoryForm)) {
      this.categoryFormIsSubmitted = true;

      this.submitted.emit({
        postForm: this.categoryForm.value,
        onError: () => (this.categoryFormIsSubmitted = false)
      });

      // if (!this.category) {
      //   this.categoryService.createOne(this.categoryForm.value as CategoryHandlerDto).subscribe(
      //     (category: Category) => this.onClose(category, 'Created'),
      //     () => (this.categoryFormIsSubmitted = false)
      //   );
      // } else {
      //   if (!this.categoryFormToggleDelete) {
      //     this.categoryService
      //       .updateOne(this.category.id, this.categoryForm.value as CategoryHandlerDto)
      //       .subscribe(
      //         (category: Category) => this.onClose(category, 'Updated'),
      //         () => (this.categoryFormIsSubmitted = false)
      //       );
      //   } else {
      //     this.categoryService.deleteOne(this.category.id).subscribe(
      //       (category: Category) => this.onClose(category, 'Deleted'),
      //       () => (this.categoryFormIsSubmitted = false)
      //     );
      //   }
      // }
    }
  }

  onDelete(): void {
    this.categoryForm.reset();
    this.categoryForm.get('name').clearValidators();
    this.categoryForm
      .get('name')
      .setValidators([
        Validators.required,
        Validators.pattern(new RegExp('^' + this.category.name + '$'))
      ]);

    this.categoryFormToggleDelete = true;
  }

  onClose(category?: Category, message?: string): void {
    let categoryExtras: CategoryExtras = {
      relativeTo: this.activatedRoute
    };

    if (category) {
      categoryExtras = {
        ...categoryExtras,
        state: {
          message: 'category' + message,
          category
        }
      };

      message && this.snackbarService.success('Success', message);
    }

    this.router.navigate(['..'], categoryExtras).then(() => console.debug('Route changed'));
  }
}
