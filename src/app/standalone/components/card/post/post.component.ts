/** @format */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { FireStoragePipe } from '../../../pipes/fire-storage.pipe';
import type { Post } from '../../../../core/models/post.model';
import type { PostPassword } from '../../../../core/models/post-password.model';
import type { PostPrivate } from '../../../../core/models/post-private.model';

@Component({
	standalone: true,
	imports: [RouterModule, DayjsPipe, NgOptimizedImage, SkeletonDirective, AsyncPipe, FireStoragePipe],
	selector: 'app-card-post, [appCardPost]',
	templateUrl: './post.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardPostComponent {
	@Input({ required: true })
	set appCardPostPost(post: Post | PostPassword | PostPrivate) {
		this.post = post;
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
	postImagePriority: boolean = false;
	postSkeletonToggle: boolean = true;
}
