/** @format */

import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  Category,
  PlatformService,
  HelperService,
  Post,
  PostService,
  SnackbarService,
  AuthService,
  PostCreateOneDto,
  PostUpdateOneDto
} from '../core';
import { ActivatedRoute, Router } from '@angular/router';
import { iif, Subscription } from 'rxjs';
import { filter, pluck } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Split from 'split-grid';

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html'
})
export class MarkdownComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gutter') gutter: ElementRef;

  routeData$: Subscription;

  postForm: FormGroup;
  postForm$: Subscription;
  postFormIsSubmitted: boolean;
  postModal: boolean;
  postCategoryModal: boolean;

  editorMinSize = 425;
  editorWhitespace: boolean;
  editorScrollSync: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private platformService: PlatformService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private helperService: HelperService,
    private postService: PostService,
    private snackbarService: SnackbarService,
    private authService: AuthService
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
  }

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(
        pluck('data'),
        filter((post: Post) => !!post)
      )
      .subscribe((post: Post) => {
        this.postForm.patchValue({
          body: post.body,
          title: post.title,
          categoryId: post.category.id,
          categoryName: post.category.name
        });
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

  onSubmitCategoryForm(category: Category): void {
    this.authService.getAuthorization();

    this.postForm.patchValue({
      categoryId: category.id,
      categoryName: category.name
    });

    this.postCategoryModal = false;
  }

  onSubmitPostForm(postFormIsSubmitted: (submitted: boolean) => boolean): void {
    if (this.helperService.getFormValidation(this.postForm)) {
      this.postFormIsSubmitted = postFormIsSubmitted(true);

      const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));
      const postCreateOneDto: PostCreateOneDto = {
        ...this.postForm.value
      };

      iif(
        () => !!postId,
        this.postService.updateOne(postId, postCreateOneDto as PostUpdateOneDto),
        this.postService.createOne(postCreateOneDto)
      ).subscribe(
        (post: Post) => {
          this.router
            .navigate(['/@' + post.user.name, 'category', post.category.id, 'posts', post.id])
            .then(() => {
              return this.snackbarService.success('Success', 'Post saved');
            });
        },
        () => (this.postFormIsSubmitted = postFormIsSubmitted(false))
      );
    }
  }
}
