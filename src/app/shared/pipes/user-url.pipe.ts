/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Pipe({
	standalone: true,
	name: 'userUrl'
})
export class UserUrlPipe implements PipeTransform {
	constructor(private userService: UserService) {}

	transform(user: User): string {
		return this.userService.getUserUrl(user);
	}
}
