/** @format */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { Post } from '../../../../core/models/post.model';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { FireStoragePipe } from '../../../pipes/fire-storage.pipe';

@Component({
	standalone: true,
	imports: [RouterModule, DayjsPipe, NgOptimizedImage, SkeletonDirective, AsyncPipe, FireStoragePipe],
	selector: 'app-card-post, [appCardPost]',
	templateUrl: './post.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
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

	post: Post | undefined;
	postSkeletonToggle: boolean = true;
}
