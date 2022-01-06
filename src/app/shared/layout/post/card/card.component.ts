/** @format */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../../../../core';

@Component({
  selector: 'app-post-card, [appPostCard]',
  templateUrl: './card.component.html'
})
export class PostCardComponent implements OnInit, OnDestroy {
  @Input()
  set appPost(post: Post) {
    this.post = post;
  }

  @Input()
  set appPostPath(postPath: string) {
    this.postPath = postPath;
  }

  constructor() {}

  post: Post;
  postPath: string = '';

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
