/** @format */

import { Pipe, PipeTransform } from '@angular/core';
import { User, UserService } from '../../core';

@Pipe({
	name: 'userUrl'
})
export class UserUrlPipe implements PipeTransform {
	constructor(private userService: UserService) {}

	transform(user: User): string {
		return this.userService.getUserUrl(user);
	}
}
