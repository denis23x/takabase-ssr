/** @format */

import { Component, ElementRef, inject, Input } from '@angular/core';
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
	private readonly document: Document = inject(DOCUMENT);
	private readonly elementRef: ElementRef = inject(ElementRef);
	private readonly platformService: PlatformService = inject(PlatformService);

	@Input({ required: true })
	set appAvatarUser(user: Partial<User> | undefined) {
		this.user = user;

		if (this.user?.avatar) {
			this.setImage();
		} else {
			this.setIcon();
		}
	}

	user: Partial<User> | undefined;

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
