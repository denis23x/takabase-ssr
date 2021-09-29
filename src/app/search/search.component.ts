/** @format */

import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
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
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private elementRef: ElementRef
  ) {
    this.searchForm = this.fb.group({
      query: ['', [Validators.minLength(4), Validators.maxLength(24)]]
    });
  }

  ngOnInit(): void {
    this.routeQueryParams$ = this.route.queryParams
      .pipe(
        pluck('query'),
        filter((query: string | undefined) => !!query)
      )
      .subscribe(query => {
        this.searchForm.setValue({ query });

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
            relativeTo: this.route,
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
