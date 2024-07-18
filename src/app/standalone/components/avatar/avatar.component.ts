/** @format */

import { ChangeDetectionStrategy, Component, ElementRef, inject, Input } from '@angular/core';
import { toSvg } from 'jdenticon';
import { User } from '../../../core/models/user.model';
import { DOCUMENT } from '@angular/common';
import { PlatformService } from '../../../core/services/platform.service';
import { HelperService } from '../../../core/services/helper.service';

@Component({
	standalone: true,
	selector: 'app-avatar, [appAvatar]',
	templateUrl: './avatar.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarComponent {
	private readonly document: Document = inject(DOCUMENT);
	private readonly elementRef: ElementRef = inject(ElementRef);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly helperService: HelperService = inject(HelperService);

	@Input({ required: true })
	set appAvatarUser(user: Partial<User> | undefined) {
		this.user = user;

		setTimeout(() => {
			if (this.user?.avatar) {
				this.setImage();
			} else {
				this.setIcon();
			}
		});
	}

	user: Partial<User> | undefined;

	setImage(): void {
		if (this.platformService.isBrowser()) {
			const elementRef: HTMLElement = this.elementRef.nativeElement;
			const elementRefImage: HTMLImageElement = this.document.createElement('img');

			elementRefImage.id = this.helperService.getNanoId(12);
			elementRefImage.classList.add(...['bg-base-300', 'object-cover', 'object-center']);
			elementRefImage.src = './assets/images/placeholder-image.svg';
			elementRefImage.alt = this.user.name;

			/** Insert HTML */

			elementRef.innerHTML = elementRefImage.outerHTML;

			const elementHTML: HTMLElement | null = this.document.getElementById(elementRefImage.id);
			const elementHTMLImage: HTMLImageElement = elementHTML as HTMLImageElement;

			/** Set Image */

			if (elementHTMLImage) {
				elementHTMLImage.src = this.user.avatar + '?alt=media';
			}
		}
	}

	setIcon(): void {
		if (this.platformService.isBrowser()) {
			const elementRef: HTMLElement = this.elementRef.nativeElement;
			const elementRefDOMRect: DOMRect = elementRef.getBoundingClientRect();

			elementRef.innerHTML = toSvg(this.user.name, elementRefDOMRect.width, {
				backColor: '#00000000',
				padding: 0,
				replaceMode: 'observe'
			});
		}
	}
}
