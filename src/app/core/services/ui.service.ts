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

	getCSSPropertyValue(property: string): string {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			return window
				.getComputedStyle(this.document.documentElement)
				.getPropertyValue(property)
				.trim();
		}

		return '';
	}

	getHSLToRGB = (h: number, s: number, l: number): number[] => {
		s /= 100;
		l /= 100;

		/** https://www.30secondsofcode.org/js/s/hsl-to-rgb */

		const k = (n: number): number => (n + h / 30) % 12;
		const a: number = s * Math.min(l, 1 - l);

		const f = (n: number): number => {
			return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
		};

		return [
			Math.round(255 * f(0)),
			Math.round(255 * f(8)),
			Math.round(255 * f(4))
		];
	};

	getHSLToHEX = (h: number, s: number, l: number): string[] => {
		l /= 100;

		/** https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex/54014428#54014428 */

		const a: number = (s * Math.min(l, 1 - l)) / 100;
		const f = (n: number) => {
			const k: number = (n + h / 30) % 12;
			const color: number = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0');
		};

		return [f(0), f(8), f(4)];
	};

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
		} else {
			this.cookieService.removeItem('theme');
		}

		const themeValue = theme || 'light';

		this.document.documentElement.setAttribute('data-theme', themeValue);
	}

	setBackground(themeBackground: string | null): void {
		if (!!themeBackground) {
			this.cookieService.setItem('theme-background', themeBackground);
		} else {
			this.cookieService.removeItem('theme-background');
		}

		// prettier-ignore
		const backgroundElement: HTMLElement | null = this.document.querySelector('[data-theme-background]');
		const backgroundValue = themeBackground || 'slanted-gradient';

		if (backgroundElement.dataset.themeBackground !== backgroundValue) {
			this.httpClient
				.get('/assets/backgrounds/' + backgroundValue + '.svg', {
					responseType: 'text'
				})
				.subscribe({
					next: (svg: string) => {
						backgroundElement.innerHTML = svg;
						backgroundElement.dataset.themeBackground = backgroundValue;
					}
				});
		}
	}

	setPrism(themePrism: string | null): void {
		if (!!themePrism) {
			this.cookieService.setItem('theme-prism', themePrism);
		} else {
			this.cookieService.removeItem('theme-prism');
		}

		// prettier-ignore
		const prismElement: HTMLLinkElement | null = this.document.querySelector('[data-theme-prism]') as HTMLLinkElement;
		const prismValue: string = themePrism || 'default';

		if (prismElement.dataset.themePrism !== prismValue) {
			prismElement.href = 'prism-' + prismValue + '.css';
			prismElement.dataset.themePrism = prismValue;
		}
	}
}
