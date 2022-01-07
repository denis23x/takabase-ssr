/** @format */

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Category, HelperService, User, AuthService } from '../../../../core';
import { of, Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-post-create',
  templateUrl: './create.component.html'
})
export class PostCreateComponent implements OnInit, OnDestroy {
  @Output() closed = new EventEmitter<boolean>();
  @Output() submitted = new EventEmitter<(submitted: boolean) => boolean>();

  @Input()
  set appPostForm(postForm: FormGroup) {
    this.postForm = postForm;
  }

  user: User;
  user$: Subscription;

  postForm: FormGroup;
  postForm$: Subscription;
  postFormIsSubmitted: boolean;

  constructor(private helperService: HelperService, private authService: AuthService) {}

  ngOnInit(): void {
    this.user$ = this.authService.userSubject.subscribe((user: User) => (this.user = user));

    this.postForm$ = this.postForm
      .get('categoryId')
      .valueChanges.pipe(
        filter(() => this.postForm.get('categoryId').valid),
        switchMap((categoryId: number) => {
          return of(this.user.categories.find((category: Category) => category.id === categoryId));
        }),
        filter((category: Category) => !!category)
      )
      .subscribe((category: Category) => this.postForm.get('categoryName').setValue(category.name));
  }

  ngOnDestroy(): void {
    [this.user$, this.postForm$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmitPostForm(): void {
    if (this.helperService.getFormValidation(this.postForm)) {
      this.submitted.emit((submitted: boolean) => (this.postFormIsSubmitted = submitted));
    }
  }
}
