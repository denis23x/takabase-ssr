/** @format */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Pipe({
	standalone: true,
	name: 'userUrl'
})
export class UserUrlPipe implements PipeTransform {
	private readonly userService: UserService = inject(UserService);

	transform(user: User, substring: number = 0): string {
		return this.userService.getUserUrl(user, substring);
	}
}
