/** @format */

import { Component, ElementRef, Input } from '@angular/core';
import { toSvg } from 'jdenticon';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { PlatformService } from '../../../core/services/platform.service';
import { ImageTempPipe } from '../../pipes/image-temp.pipe';

@Component({
	standalone: true,
	selector: 'app-avatar, [appAvatar]',
	imports: [CommonModule, ImageTempPipe],
	templateUrl: './avatar.component.html'
})
export class AvatarComponent {
	@Input()
	set appUser(user: User) {
		this.user = user;

		if (!this.user.avatar) {
			this.setIcon();
		}
	}

	user: User | undefined;

	constructor(
		private elementRef: ElementRef,
		private platformService: PlatformService
	) {}

	setIcon(): void {
		if (this.platformService.isBrowser()) {
			const elementRef: HTMLElement = this.elementRef.nativeElement;
			const elementRefDOMRect: DOMRect = elementRef.getBoundingClientRect();

			// prettier-ignore
			const elementIcon: string = toSvg(this.user.name, elementRefDOMRect.width, {
        backColor: '#00000000',
        padding: 0,
        replaceMode: 'observe'
      });

			elementRef.insertAdjacentHTML('afterbegin', elementIcon);
		}
	}
}
