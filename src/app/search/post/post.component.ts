/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pluck, skip, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Post, PostService, PostGetAllDto } from '../../core';

@Component({
  selector: 'app-search-posts',
  templateUrl: './post.component.html'
})
export class SearchPostsComponent implements OnInit, OnDestroy {
  routeData$: Subscription;
  routeQueryParams$: Subscription;

  page = 1;
  size = 10;

  postList: Post[] = [];
  postListHasMore: boolean;
  postListLoading: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data.pipe(pluck('data')).subscribe((postList: Post[]) => {
      this.postList = postList;
      this.postListHasMore = postList.length === this.size;
    });

    this.routeQueryParams$ = this.activatedRoute.parent.queryParams
      .pipe(
        skip(1),
        tap(() => {
          this.page = 1;
          this.size = 10;

          this.postList = [];
          this.postListLoading = true;
          this.postListHasMore = false;
        })
      )
      .subscribe(() => this.getPostList(false));
  }

  ngOnDestroy(): void {
    [this.routeData$, this.routeQueryParams$].filter($ => $).forEach($ => $.unsubscribe());
  }

  getPostList(concat: boolean): void {
    let postGetAllDto: PostGetAllDto = {
      page: this.page,
      size: this.size
    };

    const { query: title = null } = this.activatedRoute.parent.snapshot.queryParams;

    if (title) {
      postGetAllDto = {
        ...postGetAllDto,
        title
      };
    }

    this.postService.findAll(postGetAllDto).subscribe((postList: Post[]) => {
      this.postList = concat ? this.postList.concat(postList) : postList;
      this.postListLoading = false;
      this.postListHasMore = postList.length === this.size;
    });
  }

  onPostListLoadMore(): void {
    this.page++;

    this.getPostList(true);
  }
}
