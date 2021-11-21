/** @format */

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, zip } from 'rxjs';
import { Post, PostGetAllDto, PostService, User } from '../core';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html'
})
export class CategoryComponent {
  routeData$: Subscription;

  page = 1;
  size = 10;

  postList: Post[] = [];
  postListHasMore: boolean;
  postListLoading: boolean;

  user: User;

  constructor(private activatedRoute: ActivatedRoute, private postService: PostService) {}

  ngOnInit(): void {
    this.routeData$ = zip(
      this.activatedRoute.parent.data.pipe(pluck('data')),
      this.activatedRoute.data.pipe(pluck('data'))
    ).subscribe(([userProfile, postList]) => {
      this.user = userProfile.user;

      this.postList = postList;
      this.postListHasMore = postList.length === this.size;
    });
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  getPostList(concat: boolean): void {
    let postGetAllDto: PostGetAllDto = {
      page: this.page,
      size: this.size,
      userId: this.user.id,
      scope: ['user']
    };

    const categoryId: number = Number(this.activatedRoute.snapshot.queryParamMap.get('categoryId'));

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
