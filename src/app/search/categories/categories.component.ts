/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pluck, skip, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CategoriesService, Category, SearchDto } from '../../core';

@Component({
  selector: 'app-search-categories',
  templateUrl: './categories.component.html'
})
export class SearchCategoriesComponent implements OnInit, OnDestroy {
  routeData$: Subscription;
  routeQueryParams$: Subscription;

  page = 1;
  size = 10;

  categoryList: Category[] = [];
  categoryListHasMore: boolean;
  categoryListLoading: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit(): void {
    this.routeData$ = this.route.data.pipe(pluck('data')).subscribe((categoryList: Category[]) => {
      this.categoryList = categoryList;
      this.categoryListHasMore = categoryList.length === this.size;
    });

    this.routeQueryParams$ = this.route.parent.queryParams
      .pipe(
        skip(1),
        tap(() => {
          this.page = 1;
          this.size = 10;

          this.categoryList = [];
          this.categoryListLoading = true;
          this.categoryListHasMore = false;
        })
      )
      .subscribe(() => this.getCategoryList(false));
  }

  ngOnDestroy(): void {
    [this.routeData$, this.routeQueryParams$].filter($ => $).forEach($ => $.unsubscribe());
  }

  getCategoryList(concat: boolean): void {
    const { query = null } = this.route.parent.snapshot.queryParams;

    let searchDto: SearchDto = {
      page: this.page,
      size: this.size
    };

    if (query) {
      searchDto = {
        ...searchDto,
        title: query
      };
    }

    this.categoriesService.getAll(searchDto).subscribe((categoryList: Category[]) => {
      this.categoryList = concat ? this.categoryList.concat(categoryList) : categoryList;
      this.categoryListLoading = false;
      this.categoryListHasMore = categoryList.length === this.size;
    });
  }

  onCategoryListLoadMore(): void {
    this.page++;

    this.getCategoryList(true);
  }
}
