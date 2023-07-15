/** @format */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
	providedIn: 'root'
})
export class CookieService {
	constructor(
		@Inject(DOCUMENT)
		private document: Document
	) {}

	getItem(key: string): any {
		const result: any = {};

		this.document.cookie.split(';').forEach((cookie: string) => {
			const [key, value]: string[] = cookie.split('=');

			result[key.trim()] = value;
		});

		return result[key];
	}

	setItem(key: string, value: string, options?: any): void {
		options = {
			...options,
			path: '/',
			domain: 'localhost'
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

	removeItem(item: string): void {
		this.setItem(item, '', {
			['max-age']: -1
		});
	}
}
