/** @format */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PlatformService } from './platform.service';
import { CookieService } from './cookie.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class UiService {
	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private cookieService: CookieService,
		private platformService: PlatformService,
		private httpClient: HttpClient
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

	setLoader(toggle: boolean): void {
		if (!!toggle) {
			// this.document.querySelector('[data-loader]').remove();
		} else {
			this.document.querySelector('[data-loader]')?.remove();
		}
	}

	setTheme(theme: string | null): void {
		if (!!theme) {
			this.cookieService.setItem('theme', theme);
			this.document.documentElement.setAttribute('data-theme', theme);
		} else {
			this.cookieService.removeItem('theme');
			this.document.documentElement.removeAttribute('data-theme');
		}
	}

	setBackground(background: string | null): void {
		if (!!background) {
			this.cookieService.setItem('background', background);
		} else {
			this.cookieService.removeItem('background');
		}

		// prettier-ignore
		const backgroundElement: HTMLElement = this.document.querySelector('[data-background]');

		// prettier-ignore
		this.httpClient
			.get('/assets/backgrounds/' + (background || 'pattern-randomized') + '.svg', {
				responseType: 'text'
			})
			.subscribe((svg: string) => (backgroundElement.innerHTML = svg));
	}
}
