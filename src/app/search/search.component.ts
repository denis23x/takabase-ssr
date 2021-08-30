/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, filter, pluck, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import {
  CategoriesService,
  Category,
  Post,
  PostService,
  User,
  UserService,
  SearchDto
} from '../core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  searchForm: FormGroup;
  searchForm$: Subscription;

  page = 1;
  size = 100;

  advancedSearch = true;

  postList: Post[] = [];
  postListHasMore = true;

  userList: User[] = [];
  categoryList: Category[] = [];

  constructor(
    private route: ActivatedRoute,
    private categoriesService: CategoriesService,
    private postService: PostService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: ['', [Validators.minLength(4), Validators.pattern(new RegExp(/\S/))]]
    });
  }

  ngOnInit() {
    this.routeData$ = this.route.data
      .pipe(pluck('data'))
      .subscribe((postList: Post[]) => (this.postList = postList));

    this.searchForm$ = this.searchForm.valueChanges
      .pipe(
        filter(() => this.searchForm.valid),
        debounceTime(400),
        tap(() => {
          this.page = 1;
          this.size = 10;

          this.postList = [];
        })
      )
      .subscribe(() => this.getSearchResults());
  }

  ngOnDestroy(): void {
    [this.routeData$, this.searchForm$].forEach($ => $?.unsubscribe());
  }

  getSearchDto(key: string): SearchDto {
    const search = this.searchForm.get('search')?.value?.trim() || '';
    const searchKeys = {
      categories: 'title',
      users: 'name',
      posts: 'title'
    };

    const searchDto: SearchDto = {
      page: this.page,
      size: this.size
    };

    if (search.length) {
      return {
        ...searchDto,
        // @ts-ignore
        [searchKeys[key]]: search
      };
    }

    return searchDto;
  }

  getSearchResults(): void {
    this.postService.getAll(this.getSearchDto('posts')).subscribe((postList: Post[]) => {
      this.postList = this.postList.concat(postList);
      this.postListHasMore = postList.length === this.size;

      if (this.advancedSearch) {
        this.userService
          .getAll(this.getSearchDto('users'))
          .subscribe((userList: User[]) => (this.userList = userList));

        this.categoriesService
          .getAll(this.getSearchDto('categories'))
          .subscribe((categoryList: Category[]) => (this.categoryList = categoryList));
      }
    });
  }

  onLoadMore(): void {
    this.page++;

    this.getSearchResults();
  }
}
