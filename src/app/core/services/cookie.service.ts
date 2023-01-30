/** @format */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class CookieService {
	constructor(
		@Inject(DOCUMENT)
		private document: Document
	) {}

	// prettier-ignore
	getItem(key: string): any {
    let result = {}

    this.document.cookie.split(";").forEach(function (cookie) {
      let [key, value] = cookie.split("=")

      result[key.trim()] = value
    })

    return result[key]
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
		let updatedCookie = encodeURIComponent(key) + '=' + encodeURIComponent(value);

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
