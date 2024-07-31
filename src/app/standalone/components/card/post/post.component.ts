/** @format */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { FireStoragePipe } from '../../../pipes/fire-storage.pipe';
import type { Post } from '../../../../core/models/post.model';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, DayjsPipe, NgOptimizedImage, SkeletonDirective, FireStoragePipe],
	selector: 'app-card-post, [appCardPost]',
	templateUrl: './post.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardPostComponent {
	@Input({ required: true })
	set appCardPostPost(post: Post) {
		this.post = post;
		this.postRouterLink.push(String(this.post.id));
	}

	@Input()
	set appCardPostType(postType: string) {
		this.postType = postType;
		this.postRouterLink.splice(this.postRouterLink.length - 1, 0, this.postType);
	}

	@Input()
	set appCardPostImagePriority(postImagePriority: boolean) {
		this.postImagePriority = postImagePriority;
	}

	@Input()
	set appCardPostSkeletonToggle(postSkeletonToggle: boolean) {
		this.postSkeletonToggle = postSkeletonToggle;
	}

	post: Post | undefined;
	postType: string | undefined;
	postImagePriority: boolean = false;
	postSkeletonToggle: boolean = true;
	postRouterLink: string[] = ['/', 'post'];
}
