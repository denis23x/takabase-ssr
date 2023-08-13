/** @format */

import { Component, ElementRef, Input } from '@angular/core';
import { toSvg } from 'jdenticon';
import { SanitizerPipe } from '../../pipes/sanitizer.pipe';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';

@Component({
	standalone: true,
	selector: 'app-avatar, [appAvatar]',
	imports: [SanitizerPipe, CommonModule],
	templateUrl: './avatar.component.html'
})
export class AvatarComponent {
	@Input()
	set appUser(user: User) {
		this.user = user;

		if (!this.user.avatar) {
			this.userJdenticon = this.getJdenticon();
		}
	}

	user: Partial<User> | undefined;
	userJdenticon: string | undefined;

	constructor(private elementRef: ElementRef) {}

	// prettier-ignore
	getJdenticon(): string {
		const elementRefDOMRect: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();

		return toSvg(this.user.name, elementRefDOMRect.width, {
			backColor: '#00000000',
			padding: 0,
			replaceMode: 'observe'
		});
	}
}
