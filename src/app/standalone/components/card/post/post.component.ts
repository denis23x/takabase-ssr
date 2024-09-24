/** @format */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import type { Post, PostType } from '../../../../core/models/post.model';
import type { HighlightResult } from '@algolia/client-search';

interface PostHighlightResult {
	_highlightResult: HighlightResult<Pick<Post, 'name' | 'description'>>;
}

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, DayjsPipe, SkeletonDirective, SvgIconComponent],
	selector: 'app-card-post, [appCardPost]',
	templateUrl: './post.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardPostComponent {
	@Input({ required: true })
	set appCardPostPost(post: Post & Partial<PostHighlightResult>) {
		this.post = post;
		this.postRouterLink.push(String(this.post.id));
	}

	@Input()
	set appCardPostType(postType: PostType) {
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

	post: (Post & Partial<PostHighlightResult>) | undefined;
	postType: PostType = 'category';
	postImagePriority: boolean = false;
	postSkeletonToggle: boolean = true;
	postRouterLink: string[] = ['/', 'post'];
}
