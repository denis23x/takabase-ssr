/** @format */

import { Component, ElementRef, Input } from '@angular/core';
import { toSvg } from 'jdenticon';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../../../core/services/platform.service';

@Component({
	standalone: true,
	selector: 'app-avatar, [appAvatar]',
	imports: [CommonModule],
	templateUrl: './avatar.component.html'
})
export class AvatarComponent {
	@Input()
	set appAvatarUser(user: User | undefined) {
		this.user = user;

		if (this.user?.avatar) {
			this.setImage();
		} else {
			this.setIcon();
		}
	}

	user: User | undefined;

	constructor(
		private elementRef: ElementRef,
		private platformService: PlatformService
	) {}

	setImage(): void {
		this.elementRef.nativeElement.querySelector('svg')?.remove();
	}

	setIcon(): void {
		if (this.platformService.isBrowser()) {
			const elementRef: HTMLElement = this.elementRef.nativeElement;
			const elementRefDOMRect: DOMRect = elementRef.getBoundingClientRect();

			const elementIcon: string = toSvg(this.user.name, elementRefDOMRect.width, {
				backColor: '#00000000',
				padding: 0,
				replaceMode: 'observe'
			});

			elementRef.insertAdjacentHTML('afterbegin', elementIcon);
		}
	}
}
