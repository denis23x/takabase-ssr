/** @format */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../../../core';

@Component({
  selector: 'app-post-detail',
  templateUrl: './detail.component.html'
})
export class PostDetailComponent implements OnInit, OnDestroy {
  @Input()
  set appPost(post: Post) {
    this.post = post;
  }

  post: Post;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  navigateToParent(): void {
    this.router
      .navigate(['.'], { relativeTo: this.activatedRoute.parent, queryParamsHandling: 'preserve' })
      .then(() => console.debug('Route was changed'));
  }
}
