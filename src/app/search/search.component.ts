/** @format */

import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { debounceTime, filter, pluck, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { fade } from '../app.animation';
import { PlatformService } from '../core';

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
    private formBuilder: FormBuilder,
    private elementRef: ElementRef,
    private platformService: PlatformService
  ) {
    this.searchForm = this.formBuilder.group({
      query: ['', [Validators.minLength(4), Validators.maxLength(24)]]
    });
  }

  ngOnInit(): void {
    this.routeQueryParams$ = this.activatedRoute.queryParams
      .pipe(
        pluck('query'),
        tap(() => {
          if (this.platformService.isBrowser()) {
            const timeout = setTimeout(() => {
              const ul = this.elementRef.nativeElement.querySelector('nav ul');
              const li = ul.querySelector('li a.text-info-1');

              li.scrollIntoView({ block: 'nearest' });

              clearTimeout(timeout);
            });
          }
        })
      )
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
