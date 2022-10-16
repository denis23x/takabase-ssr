/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { debounceTime, filter, pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy {
  routeQueryParams$: Subscription;

  searchForm: UntypedFormGroup;
  searchForm$: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: UntypedFormBuilder
  ) {
    this.searchForm = this.formBuilder.group({
      query: ['', [Validators.minLength(4), Validators.maxLength(24)]]
    });
  }

  ngOnInit(): void {
    this.routeQueryParams$ = this.activatedRoute.queryParams
      .pipe(pluck('query'))
      .subscribe((query: string = '') => this.searchForm.setValue({ query }));

    this.searchForm$ = this.searchForm.valueChanges
      .pipe(
        debounceTime(500),
        filter(() => this.searchForm.valid)
      )
      .subscribe(() => {
        let { query = '' } = this.searchForm.value;

        !query && (query = null);

        this.router
          .navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: { query },
            queryParamsHandling: 'merge'
          })
          .then(() => console.debug('Route changed'));
      });
  }

  ngOnDestroy(): void {
    [this.routeQueryParams$, this.searchForm$].forEach($ => $?.unsubscribe());
  }
}
