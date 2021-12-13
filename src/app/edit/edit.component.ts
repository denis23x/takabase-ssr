/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  Category,
  Post,
  PostEdit,
  PostHandlerDto,
  PostHandler,
  PostService,
  SnackbarService
} from '../core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html'
})
export class EditComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  post: Post;
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
      .subscribe((postEdit: PostEdit) => {
        this.post = postEdit.post;
        this.categoryList = postEdit.categoryList;
      });
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onSubmitForm(postHandler: PostHandler): void {
    const postId: number = Number(this.activatedRoute.snapshot.paramMap.get('postId'));

    this.postService.updateOne(postId, postHandler.postForm as PostHandlerDto).subscribe(
      (post: Post) =>
        this.router
          .navigate(['/profile/category', post.category.id, 'posts', post.id])
          .then(() => this.snackbarService.success('Success', 'Post updated')),
      () => postHandler.onError()
    );
  }
}
