/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../../../../core';
import { pluck } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post.component.html'
})
export class PostDetailComponent implements OnInit, OnDestroy {
  routeData$: Subscription;

  post: Post;

  constructor(private activatedRoute: ActivatedRoute, private location: Location) {}

  ngOnInit(): void {
    this.routeData$ = this.activatedRoute.data
      .pipe(pluck('data'))
      .subscribe((post: Post) => (this.post = post));
  }

  ngOnDestroy(): void {
    [this.routeData$].filter($ => $).forEach($ => $.unsubscribe());
  }

  onClose(): void {
    this.location.back();
  }
}
