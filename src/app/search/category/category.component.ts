/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pluck, skip, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CategoryService, Category, CategoryGetAllDto } from '../../core';

@Component({
  selector: 'app-search-category',
  templateUrl: './category.component.html'
})
export class SearchCategoryComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription;
  activatedRouteQueryParams$: Subscription;

  page: number = 1;
  size: number = 10;

  categoryList: Category[] = [];
  categoryListHasMore: boolean = false;
  categoryListLoading: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.activatedRouteData$ = this.activatedRoute.data.pipe(pluck('data')).subscribe({
      next: (categoryList: Category[]) => {
        this.categoryList = categoryList;
        this.categoryListHasMore = categoryList.length === this.size;
      },
      error: (error: any) => console.error(error),
      complete: () => console.debug('Activated route data subscription complete')
    });

    this.activatedRouteQueryParams$ = this.activatedRoute.parent.queryParams
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
      .subscribe({
        next: () => this.getCategoryList(false),
        error: (error: any) => console.error(error),
        complete: () => console.debug('Activated route parent query params subscription complete')
      });
  }

  ngOnDestroy(): void {
    [this.activatedRouteData$, this.activatedRouteQueryParams$].forEach($ => $?.unsubscribe());
  }

  getCategoryList(concat: boolean): void {
    let categoryGetAllDto: CategoryGetAllDto = {
      page: this.page,
      size: this.size,
      scope: ['user']
    };

    // prettier-ignore
    const name: string = String(this.activatedRoute.parent.snapshot.queryParamMap.get('query') || '');

    if (!!name.length) {
      categoryGetAllDto = {
        ...categoryGetAllDto,
        name
      };
    }

    this.categoryService.getAll(categoryGetAllDto).subscribe({
      next: (categoryList: Category[]) => {
        this.categoryList = concat ? this.categoryList.concat(categoryList) : categoryList;
        this.categoryListLoading = false;
        this.categoryListHasMore = categoryList.length === this.size;
      },
      error: (error: any) => console.error(error),
      complete: () => console.debug('Category service get all subscription complete')
    });
  }

  onCategoryListLoadMore(): void {
    this.page++;

    this.getCategoryList(true);
  }
}
