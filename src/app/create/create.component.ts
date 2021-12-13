/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Category, Post, PostHandlerDto, PostHandler, PostService, SnackbarService } from '../core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html'
})
export class CreateComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  categoryList: Category[] = [];

  constructor(
    private router: Router,
    private snackbarService: SnackbarService,
    private postService: PostService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((categoryList: Category[]) => (this.categoryList = categoryList));
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmitForm(postHandler: PostHandler): void {
    this.postService.createOne(postHandler.postForm as PostHandlerDto).subscribe(
      (post: Post) =>
        this.router
          .navigate(['/profile/category', post.category.id, 'posts', post.id])
          .then(() => this.snackbarService.success('Success', 'Post created')),
      () => postHandler.onError()
    );
  }
}
