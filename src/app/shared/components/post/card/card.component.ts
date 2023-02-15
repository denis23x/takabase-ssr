/** @format */

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { Post } from '../../../../core/models/post.model';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, DayjsPipe],
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
