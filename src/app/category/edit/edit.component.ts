/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Category } from '../../core';
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
    let navigationExtras: NavigationExtras = {
      relativeTo: this.activatedRoute
    };

    if (category) {
      navigationExtras = {
        ...navigationExtras,
        state: {
          message: 'categoryCreated',
          data: category
        }
      };
    }

    this.router.navigate(['../'], navigationExtras).then(() => console.debug('Route changed'));
  }
}
