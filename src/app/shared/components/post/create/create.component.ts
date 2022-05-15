/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Category,
  HelperService,
  Post,
  PostCreateDto,
  PostService,
  SnackbarService
} from '../../../../core';
import { iif, Subscription } from 'rxjs';
import { filter, pairwise, pluck, startWith, switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Navigation, Router } from '@angular/router';

@Component({
  selector: 'app-post-create',
  templateUrl: './create.component.html'
})
export class PostCreateComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription;

  categoryList: Category[] = [];
  categoryModal: boolean;

  postForm: FormGroup;
  postForm$: Subscription;
  postFormIsSubmitted: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private snackbarService: SnackbarService
  ) {
    this.postForm = this.formBuilder.group({
      body: ['', [Validators.required, Validators.minLength(24), Validators.maxLength(7200)]],
      title: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(36)]],
      categoryId: [null, [Validators.required]],
      categoryName: ['', [Validators.required]]
    });

    const navigation: Navigation = this.router.getCurrentNavigation();

    if (navigation.extras.state) {
      this.postForm.patchValue(navigation.extras.state.postForm);
    } else {
      this.router
        .navigate(['../'], {
          relativeTo: this.activatedRoute
        })
        .then(() => console.debug('Route changed'));
    }
  }

  ngOnInit(): void {
    this.activatedRouteData$ = this.activatedRoute.data
      .pipe(
        pluck('data'),
        switchMap((categoryList: Category[]) => {
          this.categoryList = categoryList;

          // prettier-ignore
          return this.activatedRoute.parent.data.pipe(pluck('data'), filter((post: Post) => !!post));
        })
      )
      .subscribe((post: Post) => {
        this.postForm.patchValue({
          title: post.title,
          categoryId: post.category.id,
          categoryName: post.category.name
        });
      });

    // prettier-ignore
    this.postForm$ = this.postForm.valueChanges
      .pipe(
        startWith(this.postForm.value),
        pairwise(),
        filter(([previousValue, nextValue]): any => previousValue.categoryId !== nextValue.categoryId)
      )
      .subscribe(([previousValue, nextValue]): any => {
        const category: Category | undefined = this.categoryList.find((category: Category) => {
          return category.id === nextValue.categoryId;
        });

        this.postForm.get('categoryName').setValue(category.name);
      });
  }

  ngOnDestroy(): void {
    [this.activatedRouteData$, this.postForm$].forEach($ => $?.unsubscribe());
  }

  onClose(): void {
    this.router
      .navigate(['..'], {
        relativeTo: this.activatedRoute
      })
      .then(() => console.debug('Route changed'));
  }

  onSubmitPostForm(): void {
    if (this.helperService.getFormValidation(this.postForm)) {
      this.postFormIsSubmitted = true;

      const postId: number = Number(this.activatedRoute.parent.snapshot.paramMap.get('postId'));
      const postCreateDto: PostCreateDto = {
        ...this.postForm.value
      };

      // @ts-ignore
      delete postCreateDto.categoryName;

      // prettier-ignore
      iif(() => !!postId, this.postService.update(postId, postCreateDto), this.postService.create(postCreateDto)).subscribe(
        (post: Post) => {
          this.router
            .navigate(['/@' + post.user.name, 'category', post.category.id, 'posts', post.id])
            .then(() => {
              return this.snackbarService.success('Post saved', {
                title: 'Cheers!'
              });
            });
        },
        () => (this.postFormIsSubmitted = false)
      );
    }
  }

  onSubmitCategoryForm(category: Category): void {
    this.categoryList.unshift(category);

    this.postForm.patchValue({
      categoryId: category.id,
      categoryName: category.name
    });

    this.categoryModal = false;
  }
}
