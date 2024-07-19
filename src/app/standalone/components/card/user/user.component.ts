/** @format */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from '../../avatar/avatar.component';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import type { User } from '../../../../core/models/user.model';

@Component({
	standalone: true,
	imports: [RouterModule, SkeletonDirective, AvatarComponent, DayjsPipe],
	selector: 'app-card-user, [appCardUser]',
	templateUrl: './user.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardUserComponent {
	@Input({ required: true })
	set appCardUserUser(user: User) {
		this.user = user;
	}

	@Input()
	set appCardUserSkeletonToggle(userSkeletonToggle: boolean) {
		this.userSkeletonToggle = userSkeletonToggle;
	}

	user: User | undefined;
	userSkeletonToggle: boolean = true;
}
