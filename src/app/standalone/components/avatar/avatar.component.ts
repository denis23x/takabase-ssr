/** @format */

import { Component, ElementRef, Inject, Input } from '@angular/core';
import { toSvg } from 'jdenticon';
import { User } from '../../../core/models/user.model';
import { CommonModule, DOCUMENT } from '@angular/common';
import { PlatformService } from '../../../core/services/platform.service';

@Component({
	standalone: true,
	selector: 'app-avatar, [appAvatar]',
	imports: [CommonModule],
	templateUrl: './avatar.component.html'
})
export class AvatarComponent {
	@Input({ required: true })
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
		@Inject(DOCUMENT)
		private document: Document,
		private elementRef: ElementRef,
		private platformService: PlatformService
	) {}

	setImage(): void {
		if (this.platformService.isBrowser()) {
			const elementRef: HTMLElement = this.elementRef.nativeElement;
			const elementImage: HTMLImageElement = this.document.createElement('img');

			elementImage.classList.add('bg-base-300');
			elementImage.loading = 'lazy';
			elementImage.src = this.user.avatar;
			elementImage.alt = this.user.name;

			elementRef.innerHTML = elementImage.outerHTML;
		}
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

			elementRef.innerHTML = elementIcon;
		}
	}
}
