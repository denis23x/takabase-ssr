/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Navigation, NavigationEnd, Params, Router } from '@angular/router';
import { EMPTY, of, Subscription } from 'rxjs';
import { User, UserProfile } from '../core';
import { filter, pluck, skip, switchMap, tap } from 'rxjs/operators';
import { Post, PostService, PostGetAllDto } from '../../post/core';
import { Category, CategoryState } from '../../category/core';

@Component({
  selector: 'app-users-profile',
  templateUrl: './profile.component.html'
})
export class UsersProfileComponent implements OnInit, OnDestroy {
  routeData$: Subscription;
  routeQueryParams$: Subscription;
  routeQueryParams: Params;
  routeState$: Subscription;

  page = 1;
  size = 10;

  user: User;
  categoryList: Category[] = [];

  postList: Post[] = [];
  postListHasMore: boolean;
  postListLoading: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private router: Router
  ) {}

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

    this.routeState$ = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        switchMap(() => {
          const navigation: Navigation = this.router.getCurrentNavigation();

          return !!Object.keys(navigation.extras.state || {}).length
            ? of(navigation.extras.state)
            : EMPTY;
        }),
        filter((state: any) => state.category),
        switchMap((categoryState: CategoryState) => {
          let categoryList: Category[] = this.categoryList;

          switch (categoryState.action) {
            case 'create':
              categoryList = categoryList.concat([categoryState.category as Category]).sort();

              return of(categoryList);
            case 'update':
              const i = categoryList.findIndex((category: Category) => {
                return category.id === categoryState.category.id;
              });

              categoryList[i] = categoryState.category;

              return of(categoryList);
            case 'delete':
              categoryList = categoryList.filter((category: Category) => {
                return category.id !== categoryState.category.id;
              });

              return of(categoryList);
            default:
              return of(categoryList);
          }
        })
      )
      .subscribe((categoryList: Category[]) => (this.categoryList = categoryList));
  }

  ngOnDestroy(): void {
    [this.routeData$, this.routeQueryParams$, this.routeState$]
      .filter($ => $)
      .forEach($ => $.unsubscribe());
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
