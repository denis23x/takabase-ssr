/** @format */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelperService, SnackbarService, Category, CategoryService } from '../../../../core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-edit',
  templateUrl: './edit.component.html'
})
export class CategoryEditComponent implements OnInit {
  @Output() closed = new EventEmitter<Category | void>();

  @Input()
  set appCategory(category: Category) {
    this.editForm.patchValue(category);
  }

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
      id: [null, [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
      isPrivate: [false]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.helperService.getFormValidation(this.editForm)) {
      this.editFormIsSubmitted = true;

      const { id, ...body } = this.editForm.value;

      this.categoryService.updateOne(id, body).subscribe(
        (category: Category) => {
          this.closed.emit(category);
          this.snackbarService.success('Success', 'Category updated!');
        },
        () => (this.editFormIsSubmitted = false)
      );
    }
  }
}
