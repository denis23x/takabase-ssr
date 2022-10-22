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
import { filter, map, pairwise, startWith, switchMap } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Data, Navigation, Router } from '@angular/router';

interface PostForm {
  body: FormControl<string>;
  title: FormControl<string>;
  categoryId: FormControl<number>;
  categoryName: FormControl<string>;
}

@Component({
  selector: 'app-post-create',
  templateUrl: './create.component.html'
})
export class PostCreateComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription | undefined;

  categoryList: Category[] = [];
  categoryModal: boolean = false;

  postForm: FormGroup | undefined;
  postForm$: Subscription | undefined;
  postFormIsSubmitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private snackbarService: SnackbarService
  ) {
    this.postForm = this.formBuilder.group<PostForm>({
      body: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(24),
        Validators.maxLength(7200)
      ]),
      title: this.formBuilder.control('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(36)
      ]),
      categoryId: this.formBuilder.control(null, [Validators.required]),
      categoryName: this.formBuilder.control('', [Validators.required])
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
        map((data: Data) => data.data),
        switchMap((categoryList: Category[]) => {
          this.categoryList = categoryList;

          return this.activatedRoute.parent.data.pipe(
            map((data: Data) => data.data),
            filter((post: Post) => !!post)
          );
        })
      )
      .subscribe({
        next: (post: Post) => {
          this.postForm.patchValue({
            title: post.title,
            categoryId: post.category.id,
            categoryName: post.category.name
          });
        },
        error: (error: any) => console.error(error)
      });

    this.postForm$ = this.postForm.valueChanges
      .pipe(
        startWith(this.postForm.value),
        pairwise(),
        // prettier-ignore
        filter(([previousValue, nextValue]): any => previousValue.categoryId !== nextValue.categoryId)
      )
      .subscribe({
        next: ([previousValue, nextValue]): any => {
          const category: Category | undefined = this.categoryList.find((category: Category) => {
            return category.id === nextValue.categoryId;
          });

          this.postForm.get('categoryName').setValue(category.name);
        },
        error: (error: any) => console.error(error)
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

      iif(
        () => !!postId,
        this.postService.update(postId, postCreateDto),
        this.postService.create(postCreateDto)
      ).subscribe({
        next: (post: Post) => {
          this.router
            .navigate(['/@' + post.user.name, 'category', post.category.id, 'posts', post.id])
            .then(() => {
              return this.snackbarService.success('Post saved', {
                title: 'Cheers!'
              });
            });
        },
        error: () => (this.postFormIsSubmitted = false)
      });
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
