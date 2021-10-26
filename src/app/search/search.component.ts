/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, filter, pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { fade } from '../app.animation';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  animations: [fade]
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
        debounceTime(1000),
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
          .then(() => console.debug('Route was changed'));
      });
  }

  ngOnDestroy(): void {
    [this.routeQueryParams$, this.searchForm$].filter($ => $).forEach($ => $.unsubscribe());
  }
}
