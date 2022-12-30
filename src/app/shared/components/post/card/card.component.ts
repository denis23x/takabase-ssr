/** @format */

import { Component, Input, OnInit } from '@angular/core';
import { Post } from '../../../../core';

@Component({
	selector: 'app-post-card, [appPostCard]',
	templateUrl: './card.component.html'
})
export class PostCardComponent implements OnInit {
	@Input()
	set appPost(post: Post) {
		this.post = post;
	}

	@Input()
	set appPath(path: string) {
		this.path = path;
	}

	constructor() {}

	post: Post | undefined;
	path: string = '';

	ngOnInit(): void {}
}
