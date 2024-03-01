/** @format */

import { inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PlatformService } from './platform.service';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';
import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';

@Injectable({
	providedIn: 'root'
})
export class HelperService {
	private readonly document: Document = inject(DOCUMENT);
	private readonly platformService: PlatformService = inject(PlatformService);

	setCamelCaseToDashCase(value: string): string {
		// eslint-disable-next-line @typescript-eslint/no-shadow
		return value.replace(/[A-Z]/g, (value: string): string => '-' + value.toLowerCase());
	}

	getRegex(regExp: string, payload?: any): RegExp {
		// prettier-ignore
		switch (regExp) {
			case 'bucket':
				return new RegExp('takabase-(local|dev|prod)\\.appspot\\.com', 'i');
			case 'bucket-temp':
				return new RegExp('takabase-(local|dev|prod)-temp', 'i');
			case 'markdown-image':
				return new RegExp('!\\[(.*?)]\\((.*?)\\)', 'g');
			case 'markdown-image-url':
				return new RegExp('(?<=\\().+?(?=\\))', 'i');
			case 'extension':
				return new RegExp('.[a-z]+$', 'i');
			case 'no-whitespace':
				return new RegExp('^\\S*$', 'm');
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
				throw new Error(`Invalid regex type specified: ${regExp}`);
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

	getNanoId(size: number = 12): string {
		if (this.platformService.isBrowser()) {
			return customAlphabet(alphanumeric, size)();
		}

		return (Math.random() + 1).toString(36).substring(2);
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

	getURL(): URL {
		return new URL(this.document.URL, environment.appUrl);
	}
}
