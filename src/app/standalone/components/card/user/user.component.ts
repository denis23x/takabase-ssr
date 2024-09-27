/** @format */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { RouterModule } from '@angular/router';
import { UserAvatarComponent } from '../../user/avatar/avatar.component';
import type { User } from '../../../../core/models/user.model';
import type { HighlightResult } from '@algolia/client-search';
import type { Post } from '../../../../core/models/post.model';

interface UserHighlightResult {
	_highlightResult: HighlightResult<Pick<Post, 'name' | 'description'>>;
}

@Component({
	standalone: true,
	imports: [RouterModule, SkeletonDirective, UserAvatarComponent],
	selector: 'app-card-user, [appCardUser]',
	templateUrl: './user.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardUserComponent {
	@Input({ required: true })
	set appCardUserUser(user: User & Partial<UserHighlightResult>) {
		this.user = user;
	}

	@Input()
	set appCardUserSkeletonToggle(userSkeletonToggle: boolean) {
		this.userSkeletonToggle = userSkeletonToggle;
	}

	user: (User & Partial<UserHighlightResult>) | undefined;
	userSkeletonToggle: boolean = true;
}
