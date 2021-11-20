/** @format */

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Post, PostGetAllDto, PostService } from '../core';
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

  constructor(private activatedRoute: ActivatedRoute, private postService: PostService) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data.pipe(pluck('data')).subscribe((postList: Post[]) => {
      this.postList = postList;
      this.postListHasMore = postList.length === this.size;
    });
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  getPostList(concat: boolean): void {
    let postGetAllDto: PostGetAllDto = {
      // userId: this.user.id,
      page: this.page,
      size: this.size,
      scope: ['user']
    };

    const categoryId = this.activatedRoute.snapshot.queryParamMap.get('categoryId');

    if (categoryId) {
      postGetAllDto = {
        ...postGetAllDto,
        categoryId: Number(categoryId)
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
