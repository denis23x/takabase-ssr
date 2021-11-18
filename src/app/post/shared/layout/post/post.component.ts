/** @format */

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { HelperService } from '../../../../core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Category } from '../../../../category/core';

@Component({
  selector: 'app-post, [appPost]',
  templateUrl: './post.component.html'
})
export class PostComponent implements OnInit, OnDestroy {
  @Output() submitPost = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  @Input()
  set appCategoryList(categoryList: Category[]) {
    this.categoryList = categoryList;
  }

  postForm: FormGroup;
  postForm$: Subscription;
  postFormIsSubmitted: boolean;

  categoryList: Category[];
  categoryActive: Category;

  constructor(private formBuilder: FormBuilder, private helperService: HelperService) {
    this.postForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
      categoryId: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.postForm$ = this.postForm
      .get('categoryId')
      .valueChanges.subscribe((categoryId: number) => {
        this.categoryActive = this.categoryList.find((category: Category) => {
          return category.id === categoryId;
        });
      });
  }

  ngOnDestroy(): void {
    [this.postForm$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.postForm)) {
      this.postFormIsSubmitted = true;

      this.submitPost.emit(this.postForm.value);

      this.onClose();
    }
  }

  onClose(): void {
    this.postForm.reset();

    this.categoryActive = undefined;

    this.closed.emit();
  }
}
