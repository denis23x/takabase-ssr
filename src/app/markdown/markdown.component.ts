/** @format */

import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  Category,
  PlatformService,
  HelperService,
  Post,
  PostService,
  SnackbarService,
  CategoryService,
  User
} from '../core';
import { ActivatedRoute, Router } from '@angular/router';
import { iif, Subscription } from 'rxjs';
import { filter, first, pluck } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Split from 'split-grid';

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html'
})
export class MarkdownComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gutter') gutter: ElementRef;

  routeData$: Subscription;

  user: User;

  post: Post;
  postForm: FormGroup;
  postForm$: Subscription;
  postFormIsSubmitted: boolean;
  postModal: boolean;

  editorMinSize = 425;
  editorWhitespace: boolean;
  editorScrollSync: boolean;

  categoryList: Category[] = [];
  categoryForm: FormGroup;
  categoryFormIsSubmitted: boolean;
  categoryModal: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private platformService: PlatformService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private helperService: HelperService,
    private postService: PostService,
    private snackbarService: SnackbarService,
    private categoryService: CategoryService
  ) {
    this.postForm = this.formBuilder.group({
      body: [
        'Lorem Ipsum - это текст-"рыба", часто используемый в печати и вэб-дизайне. Lorem Ipsum является стандартной "рыбой" для текстов на латинице с начала XVI века.',
        [Validators.required, Validators.minLength(32), Validators.maxLength(6400)]
      ],
      title: ['Lorem', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]],
      categoryId: [null, [Validators.required]],
      categoryName: ['', [Validators.required]]
    });

    this.categoryForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(24)]]
    });
  }

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe(([user, categoryList, post]) => {
        this.user = user;

        this.categoryList = categoryList;

        if (post) {
          this.post = post;

          this.postForm.patchValue({
            body: this.post.body,
            title: this.post.title,
            categoryId: this.post.category.id,
            categoryName: this.post.category.name
          });
        }
      });

    this.postForm$ = this.postForm
      .get('categoryId')
      .valueChanges.pipe(filter(() => this.postForm.get('categoryId').valid))
      .subscribe((categoryId: number) => {
        const category: Category = this.categoryList.find((category: Category) => {
          return category.id === categoryId;
        });

        this.postForm.get('categoryName').setValue(category.name);
      });
  }

  ngAfterViewInit(): void {
    if (this.platformService.isBrowser()) {
      Split({
        minSize: this.editorMinSize,
        columnGutters: [
          {
            track: 1,
            element: this.gutter.nativeElement
          }
        ]
      });
    }
  }

  ngOnDestroy(): void {
    [this.routeData$, this.postForm$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmitPostForm(): void {
    if (this.helperService.getFormValidation(this.postForm)) {
      this.postFormIsSubmitted = true;

      const isUpdate: boolean = !!this.post;

      iif(
        () => isUpdate,
        this.postService.updateOne(this.post?.id, this.postForm.value),
        this.postService.createOne(this.postForm.value)
      )
        .pipe(first())
        .subscribe(
          (post: Post) => {
            this.router
              .navigate(['/users', this.user.id, 'category', post.category.id, 'posts', post.id])
              .then(() => {
                return this.snackbarService.success(
                  'Success',
                  'Post' + isUpdate ? 'updated' : 'created'
                );
              });
          },
          () => (this.postFormIsSubmitted = false)
        );
    }
  }

  onSubmitCategoryForm(): void {
    if (this.helperService.getFormValidation(this.categoryForm)) {
      this.categoryFormIsSubmitted = true;

      this.categoryService.createOne(this.categoryForm.value).subscribe(
        (category: Category) => {
          this.categoryList.unshift(category);
          this.categoryForm.reset();
          this.categoryFormIsSubmitted = false;
          this.categoryModal = false;

          this.postForm.patchValue({
            categoryId: category.id,
            categoryName: category.name
          });

          this.snackbarService.success('Success', 'Category created');
        },
        () => (this.categoryFormIsSubmitted = false)
      );
    }
  }
}
