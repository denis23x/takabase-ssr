/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  Category,
  CategoryService,
  CategoryUpdateDto,
  HelperService,
  SnackbarService
} from '../../../../core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { iif } from 'rxjs';

interface CategoryForm {
  id: FormControl<number>;
  name: FormControl<string>;
}

@Component({
  selector: 'app-category-edit',
  templateUrl: './edit.component.html'
})
export class CategoryEditComponent implements OnInit {
  @Output() submitted = new EventEmitter<Category>();
  @Output() closed = new EventEmitter<boolean>();

  @Input()
  set appCategory(category: Category) {
    this.category = category;

    this.categoryForm.patchValue({
      id: this.category.id,
      name: this.category.name
    });
  }

  category: Category;
  categoryForm: FormGroup;
  categoryFormIsSubmitted: boolean = false;
  categoryFormIsToggled: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private categoryService: CategoryService,
    private snackbarService: SnackbarService
  ) {
    this.categoryForm = this.formBuilder.group<CategoryForm>({
      id: this.formBuilder.control(null, [Validators.required]),
      name: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(24)
      ])
    });
  }

  ngOnInit(): void {}

  onToggle(toggle: boolean): void {
    const abstractControl: AbstractControl = this.categoryForm.get('name');

    abstractControl.reset();
    abstractControl.clearValidators();

    if (toggle) {
      abstractControl.setValidators([
        Validators.required,
        Validators.pattern(new RegExp('^' + this.category.name + '$'))
      ]);
    } else {
      abstractControl.setValue(this.category.name);
      abstractControl.setValidators([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(24)
      ]);
    }

    this.categoryFormIsToggled = toggle;
  }

  onSubmitCategoryForm(): void {
    if (this.helperService.getFormValidation(this.categoryForm)) {
      this.categoryFormIsSubmitted = true;

      const categoryId: number = this.categoryForm.value.id;
      const categoryUpdateDto: CategoryUpdateDto = {
        ...this.categoryForm.value
      };

      iif(
        () => this.categoryFormIsToggled,
        this.categoryService.delete(categoryId),
        this.categoryService.update(categoryId, categoryUpdateDto)
      ).subscribe({
        next: (category: Category) => {
          if (this.categoryFormIsToggled) {
            category = {
              ...category,
              id: 0
            };
          }

          this.submitted.emit(category);

          this.snackbarService.success(!!category.id ? 'Category updated' : 'Category deleted');

          this.categoryFormIsSubmitted = false;
        },
        error: () => (this.categoryFormIsSubmitted = false),
        complete: () => console.debug('Category service delete/update subscription complete')
      });
    }
  }
}
