/** @format */

import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PlatformService } from './platform.service';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';
import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';
import { Navigation } from '@angular/router';
import { CookiesService } from './cookies.service';
import { from, Observable, of } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class HelperService {
	private readonly document: Document = inject(DOCUMENT);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly cookiesService: CookiesService = inject(CookiesService);

	upsertSessionCookie(cookie: Record<string, any>): void {
		const cookieString: string | undefined = this.cookiesService.getItem('__session');
		const cookieObject: any = JSON.parse(atob(cookieString || '') || '{}');
		const cookieUpsert: any = {
			...cookieObject,
			...cookie
		};

		/** https://firebase.google.com/docs/hosting/manage-cache */

		this.cookiesService.setItem('__session', btoa(JSON.stringify(cookieUpsert)));
	}

	getCamelCaseToDashCase(value: string): string {
		// eslint-disable-next-line @typescript-eslint/no-shadow
		return value.replace(/[A-Z]/g, (value: string): string => '-' + value.toLowerCase());
	}

	getRegex(regExp: string): RegExp {
		switch (regExp) {
			case 'extension':
				return new RegExp('.[a-z]+$', 'i');
			case 'no-whitespace':
				return new RegExp('^\\S*$', 'm');
			case 'username':
				return new RegExp('^\\w[\\w\\d\\-]*$', 'm');
			case 'password':
				return new RegExp('^(?=.*[\\d!@#$%^&*]).+$', 'm');
			case 'url':
				return new RegExp('^([a-zA-Z][a-zA-Z0-9+.\\-]{1,31}):([^<>\x00-\x20]*)$', 'm');
			case 'youtube':
				return new RegExp('^.*((youtu.be\\/)|(v\\/)|(\\/u\\/\\w\\/)|(embed\\/)|(watch\\?))\\??v?=?([^#&?]*).*', 'm');
			default:
				throw new Error('Invalid regex specified: ' + regExp);
		}
	}

	getCustomValidator(customValidator: string): (...args: any) => ValidatorFn {
		switch (customValidator) {
			case 'match':
				return (value: string): ValidatorFn => {
					return (control: AbstractControl): ValidationErrors | null => {
						if (control.value !== value) {
							return {
								match: true
							};
						}

						return null;
					};
				};
			case 'not':
				return (value: string[]): ValidatorFn => {
					return (control: AbstractControl): ValidationErrors | null => {
						if (value.indexOf(control.value.trim().toLowerCase()) !== -1) {
							return {
								not: true
							};
						}

						return null;
					};
				};
			default:
				throw new Error('Invalid custom validator specified: ' + customValidator);
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

	setDownload(url: string, filename: string): void {
		if (this.platformService.isBrowser()) {
			const HTMLElement: HTMLAnchorElement = this.document.createElement('a');

			HTMLElement.download = filename;
			HTMLElement.href = url;

			this.document.body.appendChild(HTMLElement);

			HTMLElement.click();

			this.document.body.removeChild(HTMLElement);
		}
	}

	getNavigatorClipboard(value: string): Observable<void> {
		if (this.platformService.isBrowser()) {
			return from(this.platformService.getWindow().navigator.clipboard.writeText(value));
		}

		return of();
	}

	getURL(): URL {
		return new URL(this.document.URL, environment.appUrl);
	}

	getImageURLQueryParams(value: string): string {
		if (String(value).includes(environment.firebase.storageBucket)) {
			const url: URL = new URL(value);

			url.searchParams.set('alt', 'media');

			return url.toString();
		} else {
			return value;
		}
	}

	setNavigationError(navigation: Navigation, error: any): void {
		const navigationCurrent: string = navigation.finalUrl.toString();
		const navigationPrevious: string | undefined = navigation.previousNavigation?.finalUrl.toString();

		console.error('Error: ' + navigationPrevious + ' → ' + navigationCurrent, error);
	}

	setOmitUndefined(obj: any): any {
		return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined));
	}
}
