/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pluck, skip, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { PostService, Post, PostGetAllDto } from '../../core';

@Component({
  selector: 'app-search-post',
  templateUrl: './post.component.html'
})
export class SearchPostComponent implements OnInit, OnDestroy {
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
      size: this.size,
      scope: ['user']
    };

    const title: string = String(
      this.activatedRoute.parent.snapshot.queryParamMap.get('query') || ''
    );

    if (title) {
      postGetAllDto = {
        ...postGetAllDto,
        title
      };
    }

    this.postService.getAll(postGetAllDto).subscribe((postList: Post[]) => {
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
