/** @format */

import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { User, Category, Post, PostService, UserProfile, PostGetAllDto } from '../../core';
import { pluck, skip, tap } from 'rxjs/operators';

@Component({
  selector: 'app-users-detail',
  templateUrl: './detail.component.html'
})
export class UsersDetailComponent implements OnInit, OnDestroy {
  routeData$: Subscription;
  routeQueryParams$: Subscription;

  page = 1;
  size = 10;

  user: User;
  categoryList: Category[] = [];

  postList: Post[] = [];
  postListHasMore: boolean;
  postListLoading: boolean;

  isProfile: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(
        tap((routerData: any) => (this.isProfile = routerData.isProfile)),
        pluck('data')
      )
      .subscribe((userProfile: UserProfile) => {
        this.user = userProfile.user;
        this.categoryList = userProfile.categoryList;

        this.postList = userProfile.postList;
        this.postListHasMore = userProfile.postList.length === this.size;
      });

    this.routeQueryParams$ = this.activatedRoute.queryParams
      .pipe(
        tap(() => {
          const timeout = setTimeout(() => {
            const ul = this.elementRef.nativeElement.querySelector('nav ul');
            const li = ul.querySelector('li a.text-info-1');

            li.scrollIntoView({
              block: 'nearest'
            });

            clearTimeout(timeout);
          });
        }),
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
      size: this.size
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
