/** @format */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PlatformService } from './platform.service';
import { CookieService } from './cookie.service';
import { HttpClient } from '@angular/common/http';
import { fromEvent, Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class AppearanceService {
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

	setLoader(toggle: boolean): void {
		if (toggle) {
			// this.document.querySelector('[data-loader]').remove();
		} else {
			this.document.querySelector('[data-loader]')?.remove();
		}
	}

	setTheme(theme: string | null): void {
		if (theme) {
			this.cookieService.setItem('theme', theme);
		} else {
			this.cookieService.removeItem('theme');
		}

		const themeValue: string = theme || 'light';

		this.document.documentElement.setAttribute('data-theme', themeValue);

		/** TODO: Update meta */

		// const value: string = this.getCSSPropertyValue('--su');
		//
		// // prettier-ignore
		// const [h, s, l]: number[] = value.split(/\s/g).map((value: string) => Number(value.replace('%', '')));
		// const valueList: string[] = this.getHSLToHEX(h, s, l);
		//
		// const propertyValue: string = '#' + valueList.join('');
		// const property: string = 'theme-color';
		//
		// this.meta.updateTag({ name: property, content: propertyValue });
	}

	setThemeBackground(themeBackground: string | null): void {
		if (themeBackground) {
			this.cookieService.setItem('theme-background', themeBackground);
		} else {
			this.cookieService.removeItem('theme-background');
		}

		// prettier-ignore
		const backgroundElement: HTMLElement | null = this.document.querySelector('[data-theme-background]');
		const backgroundValue: string = themeBackground || 'slanted-gradient';

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

	setThemePrism(themePrism: string | null): void {
		if (themePrism) {
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

	setPageScrollInfinite(pageScrollInfinite: boolean | null): void {
		if (pageScrollInfinite) {
			// prettier-ignore
			this.cookieService.setItem('page-scroll-infinite', String(+pageScrollInfinite));
		} else {
			this.cookieService.removeItem('page-scroll-infinite');
		}
	}

	setPageScrollInfiniteHandler(scrollOffset?: number): Observable<boolean> {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			// prettier-ignore
			return fromEvent(window, 'scroll').pipe(
				map(() => {
					const heightScrolled: number = window.innerHeight + Math.round(window.scrollY);
          const heightOffset: number = scrollOffset || window.innerHeight
					const heightBottom: number = this.document.body.offsetHeight - heightOffset;

					return heightScrolled >= heightBottom;
				}),
        filter((pageScrollInfinite: boolean) => pageScrollInfinite)
			);
		}

		return of(false);
	}

	setPageScrollToTop(pageScrollToTop: boolean | null): void {
		if (pageScrollToTop) {
			// prettier-ignore
			this.cookieService.setItem('page-scroll-to-top', String(+pageScrollToTop));
		} else {
			this.cookieService.removeItem('page-scroll-to-top');
		}
	}
}
