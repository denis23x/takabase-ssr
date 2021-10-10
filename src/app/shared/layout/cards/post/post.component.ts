/** @format */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../../../../post/core';

@Component({
  selector: 'app-card-post, [appCardPost]',
  templateUrl: './post.component.html'
})
export class CardPostComponent implements OnInit, OnDestroy {
  @Input()
  set appPost(post: Post) {
    this.post = post;
  }

  constructor() {}

  post: Post;

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
