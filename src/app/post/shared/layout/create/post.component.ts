/** @format */

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  Event as RouterEvent,
  Navigation
} from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  HelperService,
  SnackbarService,
  Category,
  PostCreateOneDto,
  Post,
  PostService,
  CategoryState
} from '../../../../core';
import { EMPTY, of, Subscription } from 'rxjs';
import { filter, startWith, switchMap } from 'rxjs/operators';

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
  routeEvents$: Subscription;

  postForm: FormGroup;
  postForm$: Subscription;
  postFormIsSubmitted: boolean;

  categoryList: Category[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private helperService: HelperService,
    private postService: PostService,
    private snackbarService: SnackbarService,
    private router: Router,
    private activatedRoute: ActivatedRoute
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

    this.routeEvents$ = this.router.events
      .pipe(
        filter((routerEvent: RouterEvent) => routerEvent instanceof NavigationEnd),
        startWith(this.activatedRoute),
        switchMap(() => {
          const navigation: Navigation = this.router.getCurrentNavigation();

          if (navigation && navigation.extras.state) {
            return of(navigation.extras.state as CategoryState);
          }

          return EMPTY;
        })
      )
      .subscribe((categoryState: CategoryState) => {
        const { message, category } = categoryState;
        const { id } = category;

        const messageMap = {
          ['categoryCreated']: (): void => {
            this.categoryList.unshift(category);

            this.postForm.get('categoryId').setValue(id);
          }
        };

        messageMap[message]();
      });
  }

  ngOnDestroy(): void {
    [this.routeData$, this.routeEvents$].filter($ => $).forEach($ => $.unsubscribe());
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
