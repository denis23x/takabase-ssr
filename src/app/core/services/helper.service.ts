/** @format */

import { Inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PlatformService } from './platform.service';
import { DOCUMENT } from '@angular/common';

@Injectable({
	providedIn: 'root'
})
export class HelperService {
	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private platformService: PlatformService
	) {}

	setCamelCaseToDashCase(value: string): string {
		// prettier-ignore
		return value.replace(/[A-Z]/g, (value: string): string => '-' + value.toLowerCase());
	}

	getRegex(regex: string, payload?: any): RegExp {
		// prettier-ignore
		switch (regex) {
			case 'exact':
				return new RegExp('^' + payload + '$', 'm');
			case 'password':
				return new RegExp('^((?=.*\\d)|(?=.*[!@#$%^&*]))(?=.*[a-zA-Z]).{6,32}$', 'm');
      case 'url':
        // eslint-disable-next-line no-control-regex
				return new RegExp('^([a-zA-Z][a-zA-Z0-9+.\\-]{1,31}):([^<>\x00-\x20]*)$', 'm');
      case 'youtube':
        return new RegExp('^.*((youtu.be\\/)|(v\\/)|(\\/u\\/\\w\\/)|(embed\\/)|(watch\\?))\\??v?=?([^#&?]*).*', 'm');
			default:
				throw new Error(`Invalid regex type specified: ${regex}`);
		}
	}

	getFormValidation(formGroup: FormGroup): boolean {
		if (formGroup.invalid) {
			Object.keys(formGroup.controls).forEach((control: string) =>
				formGroup.get(control).markAsTouched({ onlySelf: true })
			);

			return false;
		}

		return true;
	}

	getUUID(): string {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			// @ts-ignore
			const source: string = [1e7] + -1e3 + -4e3 + -8e3 + -1e11;
			const getUUID = (n: string): string => {
				const m: number = Number(n);

				// prettier-ignore
				const uint8Array: Uint8Array = window.crypto.getRandomValues(new Uint8Array(1));

				return (m ^ (uint8Array[0] & (15 >> (m / 4)))).toString(16);
			};

			return source.replace(/[018]/g, getUUID);
		}

		return (Math.random() + 1).toString(36).substring(7);
	}

	getDownload(url: string, filename: string): void {
		if (this.platformService.isBrowser()) {
			const HTMLElement: HTMLAnchorElement = this.document.createElement('a');

			HTMLElement.download = filename;
			HTMLElement.href = url;

			this.document.body.appendChild(HTMLElement);

			HTMLElement.click();

			this.document.body.removeChild(HTMLElement);
		}
	}

	getIsUrl(value: string): boolean {
		try {
			return !!new URL(value);
		} catch (e) {
			return false;
		}
	}
}
