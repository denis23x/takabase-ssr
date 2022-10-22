/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, filter, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

interface SearchForm {
  query: FormControl<string>;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy {
  routeQueryParams$: Subscription;

  searchForm: FormGroup;
  searchForm$: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.searchForm = this.formBuilder.group<SearchForm>({
      query: this.formBuilder.control('', [Validators.minLength(4), Validators.maxLength(24)])
    });
  }

  ngOnInit(): void {
    this.routeQueryParams$ = this.activatedRoute.queryParams
      .pipe(map((data: Data) => data.query))
      .subscribe({
        next: (query: string = '') => this.searchForm.setValue({ query }),
        error: (error: any) => console.error(error)
      });

    this.searchForm$ = this.searchForm.valueChanges
      .pipe(
        debounceTime(500),
        filter(() => this.searchForm.valid)
      )
      .subscribe({
        next: () => {
          let { query = '' } = this.searchForm.value;

          !query && (query = null);

          this.router
            .navigate([], {
              relativeTo: this.activatedRoute,
              queryParams: { query },
              queryParamsHandling: 'merge'
            })
            .then(() => console.debug('Route changed'));
        },
        error: (error: any) => console.error(error)
      });
  }

  ngOnDestroy(): void {
    [this.routeQueryParams$, this.searchForm$].forEach($ => $?.unsubscribe());
  }
}
