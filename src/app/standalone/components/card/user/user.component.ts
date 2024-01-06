/** @format */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonDirective } from '../../../directives/app-skeleton.directive';
import { UserUrlPipe } from '../../../pipes/user-url.pipe';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from '../../avatar/avatar.component';
import { DayjsPipe } from '../../../pipes/dayjs.pipe';
import { User } from '../../../../core/models/user.model';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SkeletonDirective, UserUrlPipe, AvatarComponent, DayjsPipe],
	selector: 'app-card-user, [appCardUser]',
	templateUrl: './user.component.html'
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
