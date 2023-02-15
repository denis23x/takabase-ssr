/** @format */

import { Component, Input, OnInit } from '@angular/core';
import { toSvg } from 'jdenticon';
import { SanitizerPipe } from '../../pipes/sanitizer.pipe';
import { User } from '../../../core/models/user.model';

@Component({
	standalone: true,
	selector: 'app-avatar, [appAvatar]',
	imports: [SanitizerPipe],
	templateUrl: './avatar.component.html'
})
export class AvatarComponent implements OnInit {
	@Input()
	set appUser(user: User) {
		this.avatarHTML = user.avatar
			? this.getAvatar(user)
			: this.getJdenticon(user);
	}

	constructor() {}

	avatarHTML: string | undefined;
	avatarSize: number = 256;

	ngOnInit(): void {}

	getAvatar(user: User): string {
		return `
      <img
        loading="lazy"
        width="${this.avatarSize}"
        height="${this.avatarSize}"
        src="${user.avatar}"
        alt="${user.name}"
      >
    `;
	}

	getJdenticon(user: User): string {
		return toSvg(user.name, this.avatarSize, {
			backColor: '#00000000',
			padding: 0
		});
	}
}
