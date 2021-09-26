/** @format */

import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, filter, pluck, skip, tap } from 'rxjs/operators';
import { merge, Subscription } from 'rxjs';
import {
  CategoriesService,
  Category,
  Post,
  PostService,
  User,
  UserService,
  SearchDto
} from '../core';
import { SearchService } from './core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy {
  routeData$: Subscription;
  routeQueryParams$: Subscription;

  searchForm: FormGroup;
  searchForm$: Subscription;

  page = 1;
  size = 10;

  searchList: any[] = [];
  searchListHasMore = false;
  searchListLoading: boolean;

  searchMap: any = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriesService: CategoriesService,
    private postService: PostService,
    private userService: UserService,
    private fb: FormBuilder,
    private searchService: SearchService,
    private elementRef: ElementRef
  ) {
    this.searchForm = this.fb.group({
      query: ['', [searchService.getControlValidateQuery()]],
      tab: ['', [searchService.getControlValidateTab()]]
    });
  }

  ngOnInit(): void {
    this.searchMap = this.searchService.searchMap;

    this.routeData$ = this.route.data
      .pipe(pluck('data'))
      .subscribe((searchList: Category[] | User[] | Post[]) => {
        this.searchList = searchList;
        this.searchListHasMore = searchList.length === this.size;

        const { query = '', tab = 'posts' } = this.route.snapshot.queryParams;

        this.searchForm.setValue({
          query,
          tab
        });

        const t = setTimeout(() => {
          const ul = this.elementRef.nativeElement.querySelector('nav ul');
          const li = ul.querySelector('li a.text-info-1');

          li.scrollIntoView({
            block: 'nearest'
          });

          ul.scrollLeft && (ul.scrollLeft += 16);

          clearTimeout(t);
        }, 50);
      });

    this.routeQueryParams$ = this.route.queryParams
      .pipe(
        skip(1),
        pluck('tab'),
        filter((tab: string) => this.searchForm.get('tab').value !== tab),
        tap(() => {
          this.searchListLoading = true;

          this.searchList = [];
          this.searchListHasMore = false;
        })
      )
      .subscribe((tab: string) => this.searchForm.get('tab').patchValue(tab));

    this.searchForm$ = merge(
      this.searchForm.get('query').valueChanges.pipe(debounceTime(1000)),
      this.searchForm.get('tab').valueChanges.pipe(debounceTime(100))
    )
      .pipe(
        tap(() => {
          this.searchListLoading = true;

          this.page = 1;
          this.size = 10;
        })
      )
      .subscribe(() => {
        let { query = null, tab = 'posts' } = this.searchForm.value;

        !query && (query = null);

        this.router
          .navigate(['.'], {
            relativeTo: this.route,
            queryParams: { query, tab },
            queryParamsHandling: 'merge'
          })
          .then(() => this.getSearchList(false));
      });
  }

  ngOnDestroy(): void {
    [this.routeData$, this.routeQueryParams$, this.searchForm$]
      .filter($ => $)
      .forEach($ => $.unsubscribe());
  }

  getSearchDto(): SearchDto {
    let searchMap: any = this.searchMap.get(this.searchForm.get('tab').value);
    let searchDto: SearchDto = {
      page: this.page,
      size: this.size
    };

    const query = this.searchForm.get('query').value;

    if (query.length) {
      return {
        ...searchDto,
        [searchMap.query]: query
      };
    }

    return searchDto;
  }

  getSearchList(concat: boolean): void {
    this[this.searchMap.get(this.searchForm.get('tab').value).service]
      .getAll(this.getSearchDto())
      .subscribe((searchList: Category[] | User[] | Post[]) => {
        this.searchList = concat ? this.searchList.concat(searchList) : searchList;
        this.searchListHasMore = searchList.length === this.size;
        this.searchListLoading = false;
      });
  }

  onLoadMore(): void {
    this.page++;

    this.getSearchList(true);
  }
}
