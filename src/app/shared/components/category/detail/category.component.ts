/** @format */

import { Component } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Data } from '@angular/router';
import { Subscription } from 'rxjs';
import { Category, Post, PostGetAllDto, PostService, User } from '../../../../core';
import { map, skip, tap } from 'rxjs/operators';

// prettier-ignore
export const getPostGetAllDto = (postGetAllDto: PostGetAllDto, activatedRouteSnapshot: ActivatedRouteSnapshot): PostGetAllDto => {
  switch (activatedRouteSnapshot.parent.routeConfig.component.name) {
    case 'UserComponent': {
      const [user]: [User, Category[]] = activatedRouteSnapshot.parent.data.data;

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

      if (!!title.length) {
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

  page: number = 1;
  size: number = 10;

  postPath: string;
  postList: Post[] = [];
  postListLoading: boolean = false;
  postListHasMore: boolean = false;

  constructor(private activatedRoute: ActivatedRoute, private postService: PostService) {}

  ngOnInit(): void {
    // TODO: this is the error!!!
    // prettier-ignore
    this.postPath = this.activatedRoute.snapshot.parent.routeConfig.component.name === 'UserComponent' ? 'posts' : './';

    this.activatedRouteData$ = this.activatedRoute.data
      .pipe(map((data: Data) => data.data))
      .subscribe({
        next: (postList: Post[]) => {
          this.page = 1;
          this.size = 10;

          this.postList = postList;
          this.postListLoading = false;
          this.postListHasMore = postList.length === this.size;
        },
        error: (error: any) => console.error(error)
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
      .subscribe({
        next: () => this.getPostList(false),
        error: (error: any) => console.error(error)
      });
  }

  ngOnDestroy(): void {
    [this.activatedRouteData$, this.activatedRouteQueryParams$].forEach($ => $?.unsubscribe());
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

    this.postService.getAll(postGetAllDto).subscribe({
      next: (postList: Post[]) => {
        this.postList = concat ? this.postList.concat(postList) : postList;
        this.postListLoading = false;
        this.postListHasMore = postList.length === this.size;
      },
      error: (error: any) => console.error(error)
    });
  }

  onPostListLoadMore(): void {
    this.page++;

    this.getPostList(true);
  }
}
