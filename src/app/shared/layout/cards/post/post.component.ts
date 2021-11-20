/** @format */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../../../../core';

@Component({
  selector: 'app-card-post, [appCardPost]',
  templateUrl: './post.component.html'
})
export class CardPostComponent implements OnInit, OnDestroy {
  @Input()
  set appPost(post: Post) {
    this.post = post;
  }

  @Input()
  set appPath(path: string) {
    this.path = path;
  }

  constructor() {}

  post: Post;

  path = '';

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
