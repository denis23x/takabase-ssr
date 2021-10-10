/** @format */

import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { ActivatedRoute, Navigation, NavigationEnd, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { User, UserProfile } from '../core';
import { filter, pluck, skip, switchMap, tap } from 'rxjs/operators';
import { Post, PostService, PostGetAllDto } from '../../post/core';
import { Category } from '../../category/core';
import { PlatformService } from '../../core';

@Component({
  selector: 'app-users-detail',
  templateUrl: './detail.component.html'
})
export class UsersDetailComponent implements OnInit, OnDestroy {
  routeData$: Subscription;
  routeQueryParams$: Subscription;
  routeState$: Subscription;

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
    private elementRef: ElementRef,
    private platformService: PlatformService,
    private router: Router
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
          if (this.platformService.isBrowser()) {
            const timeout = setTimeout(() => {
              const ul = this.elementRef.nativeElement.querySelector('nav ul');
              const li = ul.querySelector('li a.text-info-1');

              li.scrollIntoView({ block: 'nearest' });

              clearTimeout(timeout);
            });
          }
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

    this.routeState$ = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        switchMap(() => of(this.router.getCurrentNavigation()))
      )
      .subscribe((navigation: Navigation) => {
        const state = navigation.extras.state;

        if (state) {
          this.categoryList = this.categoryList.concat([state as Category]).sort();
        }
      });
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
      size: this.size
    };

    const { categoryId = null } = this.activatedRoute.snapshot.queryParams;

    if (categoryId) {
      postGetAllDto = {
        ...postGetAllDto,
        categoryId
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
