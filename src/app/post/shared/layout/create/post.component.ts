/** @format */

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  HelperService,
  SnackbarService,
  CategoryService,
  Category,
  PostCreateOneDto,
  Post,
  PostService
} from '../../../../core';
import { EMPTY, of, Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-post-create',
  templateUrl: './post.component.html'
})
export class PostCreateComponent implements OnInit, OnDestroy {
  @Output() closed = new EventEmitter<Post | void>();

  @Input()
  set appBody(body: string) {
    this.postForm.get('body').setValue(body);
  }

  @Input()
  set appCategoryList(categoryList: Category[]) {
    this.categoryList = categoryList;
  }

  routeData$: Subscription;
  routeEvent$: Subscription;

  postForm: FormGroup;
  postForm$: Subscription;
  postFormIsSubmitted: boolean;

  categoryList: Category[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private postService: PostService,
    private snackbarService: SnackbarService,
    private router: Router
  ) {
    this.postForm = this.formBuilder.group({
      body: ['', [Validators.required, Validators.minLength(32), Validators.maxLength(6400)]],
      title: ['Lorem', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
      categoryName: ['', [Validators.required]],
      categoryId: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.postForm$ = this.postForm
      .get('categoryId')
      .valueChanges.pipe(filter(() => this.postForm.get('categoryId').valid))
      .subscribe((categoryId: number) => {
        const category: Category = this.categoryList.find((category: Category) => {
          return category.id === categoryId;
        });

        this.postForm.get('categoryName').setValue(category.name);
      });

    this.routeEvent$ = this.router.events
      .pipe(
        filter((event: any) => event instanceof NavigationEnd),
        switchMap(() => {
          const currentNavigation = this.router.getCurrentNavigation();

          if (currentNavigation.extras.state) {
            const { message, data: category } = currentNavigation.extras.state;

            if (message === 'categoryCreated') {
              this.categoryList.unshift(category);

              return of(category.id);
            }
          }

          return EMPTY;
        })
      )
      .subscribe((categoryId: number) => this.postForm.get('categoryId').setValue(categoryId));
  }

  ngOnDestroy(): void {
    [this.routeData$, this.routeEvent$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmitForm(): void {
    if (this.helperService.getFormValidation(this.postForm)) {
      this.postFormIsSubmitted = true;

      const postCreateOneDto: PostCreateOneDto = {
        ...this.postForm.value
      };

      this.postService.createOne(postCreateOneDto).subscribe(
        (post: Post) => {
          this.closed.emit(post);
          this.snackbarService.success('Success', 'Post created');
        },
        () => (this.postFormIsSubmitted = false)
      );
    }
  }
}
