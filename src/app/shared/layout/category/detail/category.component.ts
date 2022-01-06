/** @format */

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Post, PostGetAllDto, PostService, User, UserProfile } from '../../../../core';
import { pluck, skip, tap } from 'rxjs/operators';

export const getPostGetAllDto = (postGetAllDto: PostGetAllDto, snapshot: any): PostGetAllDto => {
  switch (snapshot.parent.routeConfig.component.name) {
    case 'UserComponent': {
      const userProfile: UserProfile = snapshot.parent.data.data;
      const user: User = userProfile.user;

      postGetAllDto = {
        ...postGetAllDto,
        userId: user.id
      };

      const categoryId: number = Number(snapshot.paramMap.get('categoryId'));

      if (categoryId) {
        postGetAllDto = {
          ...postGetAllDto,
          categoryId
        };
      }

      return postGetAllDto;
    }
    case 'SearchComponent': {
      const title: string = String(snapshot.parent.queryParamMap.get('query') || '');

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
  routeData$: Subscription;
  routeQueryParams$: Subscription;

  page = 1;
  size = 10;

  postList: Post[] = [];
  postListLoading: boolean;
  postListHasMore: boolean;

  constructor(private activatedRoute: ActivatedRoute, private postService: PostService) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data.pipe(pluck('data')).subscribe((postList: Post[]) => {
      this.page = 1;
      this.size = 10;

      this.postList = postList;
      this.postListLoading = false;
      this.postListHasMore = postList.length === this.size;
    });

    this.routeQueryParams$ = this.activatedRoute.queryParams
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
