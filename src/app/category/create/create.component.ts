/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { pluck } from 'rxjs/operators';
import { Category } from '../../core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category-create',
  templateUrl: './create.component.html'
})
export class CategoryCreateComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  categoryList: Category[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.routeData$ = this.route.data
      .pipe(pluck('data'))
      .subscribe((categoryList: Category[]) => (this.categoryList = categoryList));
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  navigateToParent(): void {
    this.router
      .navigate(['.'], { relativeTo: this.route.parent, queryParamsHandling: 'preserve' })
      .then(() => console.debug('Route was changed'));
  }
}
