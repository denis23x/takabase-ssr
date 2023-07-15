/** @format */

import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { Post } from '../../../../core/models/post.model';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, DayjsPipe, NgOptimizedImage],
	selector: 'app-post-card, [appPostCard]',
	templateUrl: './card.component.html'
})
export class PostCardComponent {
	@Input()
	set appPost(post: Post) {
		this.post = post;
	}

	@Input()
	set appPath(path: string) {
		this.path = path;
	}

	post: Post | undefined;
	path: string = '';
}
