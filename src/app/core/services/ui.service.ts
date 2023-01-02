/** @format */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { LocalStorageService } from './local-storage.service';
import { PlatformService } from './platform.service';

@Injectable()
export class UiService {
	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private localStorageService: LocalStorageService,
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

	setTheme(theme?: string): void {
		if (this.platformService.isBrowser()) {
			if (!!theme) {
				this.localStorageService.setItem('theme', theme);
				this.document.documentElement.setAttribute('data-theme', theme);
			} else {
				this.localStorageService.removeItem('theme');
				this.document.documentElement.removeAttribute('data-theme');
			}
		}
	}
}
