/** @format */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PlatformService } from './platform.service';

@Injectable({
	providedIn: 'root'
})
export class CookieService {
	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private platformService: PlatformService
	) {}

	getItem(key: string): string | undefined {
		if (this.platformService.isBrowser()) {
			const result: any = {};

			this.document.cookie.split(';').forEach((cookie: string) => {
				const [key, value]: string[] = cookie.split('=');

				result[key.trim()] = value;
			});

			return result[key];
		}

		return undefined;
	}

	setItem(key: string, value: string, options?: any): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			options = {
				...options,
				path: '/',
				domain: window.location.host
			};

			if (options.expires instanceof Date) {
				options.expires = options.expires.toUTCString();
			}

			// prettier-ignore
			let updatedCookie: string = encodeURIComponent(key) + '=' + encodeURIComponent(value);

			for (const optionKey in options) {
				updatedCookie += '; ' + optionKey;

				const optionValue = options[optionKey];

				if (optionValue !== true) {
					updatedCookie += '=' + optionValue;
				}
			}

			this.document.cookie = updatedCookie;
		}
	}

	removeItem(item: string): void {
		this.setItem(item, '', {
			['max-age']: -1
		});
	}
}
