/** @format */

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { HelperService, Category } from '../../../../core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-post, [appPost]',
  templateUrl: './post.component.html'
})
export class PostComponent implements OnInit, OnDestroy {
  @Output() submitted = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  @Input()
  set appCategoryList(categoryList: Category[]) {
    this.categoryList = categoryList;
  }

  postForm: FormGroup;
  postForm$: Subscription;
  postFormIsSubmitted: boolean;

  categoryList: Category[];

  constructor(private formBuilder: FormBuilder, private helperService: HelperService) {
    this.postForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
      categoryName: ['', [Validators.required]],
      categoryId: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.postForm$ = this.postForm
      .get('categoryId')
      .valueChanges.subscribe((categoryId: number) => {
        const category: Category = this.categoryList.find((category: Category) => {
          return category.id === categoryId;
        });

        this.postForm.get('categoryName').setValue(category.name);
      });
  }

  ngOnDestroy(): void {
    [this.postForm$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.postForm)) {
      this.postFormIsSubmitted = true;

      this.submitted.emit(this.postForm.value);

      this.onClose();
    }
  }

  onClose(): void {
    this.postForm.reset();

    this.closed.emit();
  }
}
