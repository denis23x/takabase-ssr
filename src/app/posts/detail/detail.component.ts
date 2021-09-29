/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { pluck } from 'rxjs/operators';
import { Post } from '../../core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-posts-detail',
  templateUrl: './detail.component.html'
})
export class PostsDetailComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  post: Post;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.routeData$ = this.route.data
      .pipe(pluck('data'))
      .subscribe((post: Post) => (this.post = post));
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
