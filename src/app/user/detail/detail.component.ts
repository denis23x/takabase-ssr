/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Navigation, NavigationEnd, Params, Router } from '@angular/router';
import { EMPTY, of, Subscription } from 'rxjs';
import { User, UserProfile } from '../core';
import { filter, pluck, skip, switchMap, tap } from 'rxjs/operators';
import { Post, PostService, PostGetAllDto } from '../../post/core';
import { Category, CategoryState } from '../../category/core';

@Component({
  selector: 'app-users-detail',
  templateUrl: './detail.component.html'
})
export class UsersDetailComponent implements OnInit, OnDestroy {
  routeData$: Subscription;
  routeQueryParams$: Subscription;
  routeQueryParams: Params;

  page = 1;
  size = 10;

  user: User;
  categoryList: Category[] = [];

  postList: Post[] = [];
  postListHasMore: boolean;
  postListLoading: boolean;

  constructor(private activatedRoute: ActivatedRoute, private postService: PostService) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((userProfile: UserProfile) => {
        this.user = userProfile.user;
        this.categoryList = userProfile.categoryList;

        this.postList = userProfile.postList;
        this.postListHasMore = userProfile.postList.length === this.size;
      });

    this.routeQueryParams$ = this.activatedRoute.queryParams
      .pipe(
        tap((queryParams: Params) => (this.routeQueryParams = queryParams)),
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
      userId: this.user.id,
      page: this.page,
      size: this.size,
      scope: ['user']
    };

    const { categoryId = null } = this.activatedRoute.snapshot.queryParams;

    if (categoryId) {
      postGetAllDto = {
        ...postGetAllDto,
        categoryId
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
