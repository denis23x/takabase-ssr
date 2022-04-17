/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../../../../core';
import { pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post.component.html'
})
export class PostDetailComponent implements OnInit, OnDestroy {
  activatedRouteData$: Subscription;

  post: Post;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.activatedRouteData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((post: Post) => (this.post = post));
  }

  ngOnDestroy(): void {
    [this.activatedRouteData$].forEach($ => $?.unsubscribe());
  }

  onClose(): void {
    this.router
      .navigate(['..'], {
        relativeTo: this.activatedRoute,
        queryParamsHandling: 'preserve'
      })
      .then(() => console.debug('Route changed'));
  }
}
