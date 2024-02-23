/** @format */

import { Component, Input } from '@angular/core';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { Post } from '../../../../core/models/post.model';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { AppCheckPipe } from '../../../pipes/app-check.pipe';

@Component({
	standalone: true,
	imports: [RouterModule, DayjsPipe, NgOptimizedImage, SkeletonDirective, AppCheckPipe, AsyncPipe],
	selector: 'app-card-post, [appCardPost]',
	templateUrl: './post.component.html'
})
export class CardPostComponent {
	@Input({ required: true })
	set appCardPostPost(post: Post) {
		this.post = post;
	}

	@Input()
	set appCardPostSkeletonToggle(postSkeletonToggle: boolean) {
		this.postSkeletonToggle = postSkeletonToggle;
	}

	@Input()
	set appPostUrl(postUrl: string) {
		this.postUrl = postUrl;
	}

	post: Post | undefined;
	postSkeletonToggle: boolean = true;
	postUrl: string = '';
}
