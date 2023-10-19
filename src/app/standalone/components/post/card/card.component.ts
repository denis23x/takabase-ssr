/** @format */

import { Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { Post } from '../../../../core/models/post.model';
import { AppSkeletonDirective } from '../../../directives/app-skeleton.directive';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		DayjsPipe,
		NgOptimizedImage,
		AppSkeletonDirective
	],
	selector: 'app-post-card, [appPostCard]',
	templateUrl: './card.component.html'
})
export class PostCardComponent {
	@Input()
	set appPost(post: Post) {
		this.post = post;
	}

	@Input()
	set appPostUrl(postUrl: string) {
		this.postUrl = postUrl;
	}

	post: Post | undefined;
	postSkeletonToggle: boolean = true;
	postUrl: string = '';
}
