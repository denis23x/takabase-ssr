/** @format */

import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PlatformService } from './platform.service';
import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class CookiesService {
	private readonly document: Document = inject(DOCUMENT);
	private readonly platformService: PlatformService = inject(PlatformService);

	getItem(key: string, cookie: string = ''): string | undefined {
		const result: any = {};
		const get = (): string => {
			if (this.platformService.isBrowser()) {
				return cookie || this.document.cookie;
			} else {
				return cookie;
			}
		};

		get()
			.split(';')
			.map((chunk: string) => chunk.trim())
			.map((chunk: string) => chunk.split('='))
			.forEach(([key, value]: string[]) => (result[key] = value));

		return result[key];
	}

	setItem(key: string, value: string, options?: any): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			options = {
				...options,
				path: '/',
				domain: window.location.hostname
			};

			if (environment.production) {
				options = {
					...options,
					secure: true,
					sameSite: 'strict'
				};
			}

			if (options.expires instanceof Date) {
				options.expires = options.expires.toUTCString();
			}

			let updatedCookie: string = key + '=' + value;

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
