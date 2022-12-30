/** @format */

import { Component, Input, OnInit } from '@angular/core';
import { toSvg } from 'jdenticon';
import { User } from '../../../core';

@Component({
	selector: 'app-avatar, [appAvatar]',
	templateUrl: './avatar.component.html'
})
export class AvatarComponent implements OnInit {
	@Input()
	set appUser(user: User) {
		this.user = user;
	}

	constructor() {}

	user: User | undefined;

	avatar: string | undefined;
	avatarClassList: string[] = ['rounded-full'];
	avatarSize: number = 256;

	ngOnInit(): void {
		this.avatar = this.user.avatar ? this.getAvatar() : this.getJdenticon();
	}

	getAvatar(): string {
		return `
      <img
        loading="lazy"
        width="${this.avatarSize}"
        height="${this.avatarSize}"
        src="${this.user.avatar}"
        alt="${this.user.name}"
      >
    `;
	}

	getJdenticon(): string {
		return toSvg(this.user.name, this.avatarSize, {
			backColor: '#00000000',
			padding: 0
		});
	}
}
