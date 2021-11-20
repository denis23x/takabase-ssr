/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../core';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html'
})
export class PostComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  post: Post;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((post: Post) => (this.post = post));
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  navigateToParent(): void {
    this.router
      .navigate(['.'], { relativeTo: this.activatedRoute.parent, queryParamsHandling: 'preserve' })
      .then(() => console.debug('Route was changed'));
  }
}
