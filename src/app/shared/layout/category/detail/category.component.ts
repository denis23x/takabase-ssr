/** @format */

import { Component } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { Subscription } from 'rxjs';
import { Post, PostGetAllDto, PostService, User } from '../../../../core';
import { pluck, skip, tap } from 'rxjs/operators';

export const getPostGetAllDto = (
  postGetAllDto: PostGetAllDto,
  activatedRouteSnapshot: ActivatedRouteSnapshot
): PostGetAllDto => {
  switch (activatedRouteSnapshot.parent.routeConfig.component.name) {
    case 'UserComponent': {
      const user: User = activatedRouteSnapshot.parent.data.data;

      postGetAllDto = {
        ...postGetAllDto,
        userId: user.id
      };

      const categoryId: number = Number(activatedRouteSnapshot.paramMap.get('categoryId'));

      if (categoryId) {
        postGetAllDto = {
          ...postGetAllDto,
          categoryId
        };
      }

      return postGetAllDto;
    }
    case 'SearchComponent': {
      const title: string = String(activatedRouteSnapshot.parent.queryParamMap.get('query') || '');

      if (title) {
        postGetAllDto = {
          ...postGetAllDto,
          title
        };
      }

      return postGetAllDto;
    }
    default: {
      return postGetAllDto;
    }
  }
};

@Component({
  selector: 'app-category-detail',
  templateUrl: './category.component.html'
})
export class CategoryDetailComponent {
  activatedRouteData$: Subscription;
  activatedRouteQueryParams$: Subscription;

  page = 1;
  size = 10;

  postPath: string;
  postList: Post[] = [];
  postListLoading: boolean;
  postListHasMore: boolean;

  constructor(private activatedRoute: ActivatedRoute, private postService: PostService) {}

  ngOnInit(): void {
    // prettier-ignore
    this.postPath = this.activatedRoute.snapshot.parent.routeConfig.component.name === 'UserComponent' ? 'posts' : './';

    this.activatedRouteData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((postList: Post[]) => {
        this.page = 1;
        this.size = 10;

        this.postList = postList;
        this.postListLoading = false;
        this.postListHasMore = postList.length === this.size;
      });

    this.activatedRouteQueryParams$ = this.activatedRoute.queryParams
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
    // prettier-ignore
    [this.activatedRouteData$, this.activatedRouteQueryParams$].filter($ => $).forEach($ => $.unsubscribe());
  }

  getPostList(concat: boolean): void {
    let postGetAllDto: PostGetAllDto = {
      page: this.page,
      size: this.size,
      scope: ['user', 'category']
    };

    postGetAllDto = {
      ...getPostGetAllDto(postGetAllDto, this.activatedRoute.snapshot)
    };

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
