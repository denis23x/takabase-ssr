/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { pluck } from 'rxjs/operators';
import { Category, Post, PostExtras } from '../../core';
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
    let postExtras: PostExtras = {
      relativeTo: this.activatedRoute
    };

    if (post) {
      postExtras = {
        ...postExtras,
        state: {
          message: 'postCreated',
          post
        }
      };
    }

    this.router.navigate(['..'], postExtras).then(() => console.debug('Route changed'));
  }
}
