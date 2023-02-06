/** @format */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PlatformService } from './platform.service';
import { CookieService } from './cookie.service';

@Injectable({
	providedIn: 'root'
})
export class UiService {
	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private cookieService: CookieService,
		private platformService: PlatformService
	) {}

	setOverlay(toggle: boolean): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			if (this.document.body.clientHeight > window.innerHeight) {
				if (toggle) {
					this.document.body.setAttribute('class', 'overlay');
				} else {
					this.document.body.removeAttribute('class');
				}
			} else {
				this.document.body.removeAttribute('class');
			}
		}
	}

	setTheme(theme: string | null): void {
		if (this.platformService.isBrowser()) {
			if (!!theme) {
				this.cookieService.setItem('theme', theme);
				this.document.documentElement.setAttribute('data-theme', theme);
			} else {
				this.cookieService.removeItem('theme');
				this.document.documentElement.removeAttribute('data-theme');
			}
		}
	}
}
