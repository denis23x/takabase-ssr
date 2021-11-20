/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pluck, skip, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CategoryService, Category, CategoryGetAllDto } from '../../core';

@Component({
  selector: 'app-search-categories',
  templateUrl: './category.component.html'
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
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((categoryList: Category[]) => {
        this.categoryList = categoryList;
        this.categoryListHasMore = categoryList.length === this.size;
      });

    this.routeQueryParams$ = this.activatedRoute.parent.queryParams
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
    let categoryGetAllDto: CategoryGetAllDto = {
      page: this.page,
      size: this.size,
      scope: ['user']
    };

    const { query: name = null } = this.activatedRoute.parent.snapshot.queryParams;

    if (name) {
      categoryGetAllDto = {
        ...categoryGetAllDto,
        name
      };
    }

    this.categoryService.getAll(categoryGetAllDto).subscribe((categoryList: Category[]) => {
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
