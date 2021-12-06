/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, CategoryExtras } from '../../core';
import { Subscription } from 'rxjs';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-category-edit-view',
  templateUrl: './edit.component.html'
})
export class CategoryEditViewComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  category: Category;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((category: Category) => (this.category = category));
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onClose(category?: Category | void): void {
    let categoryExtras: CategoryExtras = {
      relativeTo: this.activatedRoute
    };

    if (category) {
      categoryExtras = {
        ...categoryExtras,
        state: {
          message: 'categoryUpdated',
          category
        }
      };
    }

    this.router.navigate(['..'], categoryExtras).then(() => console.debug('Route changed'));
  }
}
