/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { pluck } from 'rxjs/operators';
import { Category, Post } from '../../core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-create-view',
  templateUrl: './post-view.component.html'
})
export class PostCreateViewComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  categoryList: Category[] = [];

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((categoryList: Category[]) => (this.categoryList = categoryList));
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onClose(post?: Post | void): void {
    let navigationExtras: NavigationExtras = {
      relativeTo: this.activatedRoute
    };

    if (post) {
      navigationExtras = {
        ...navigationExtras,
        state: {
          message: 'postCreated',
          data: post
        }
      };
    }

    this.router.navigate(['../'], navigationExtras).then(() => console.debug('Route changed'));
  }
}
