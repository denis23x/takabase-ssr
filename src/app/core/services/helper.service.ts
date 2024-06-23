/** @format */

import { inject, Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { PlatformService } from './platform.service';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../../environments/environment';
import { customAlphabet } from 'nanoid';
import { alphanumeric } from 'nanoid-dictionary';
import { Navigation } from '@angular/router';

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

	getRegex(regExp: string): RegExp {
		switch (regExp) {
			case 'extension':
				return new RegExp('.[a-z]+$', 'i');
			case 'no-whitespace':
				return new RegExp('^\\S*$', 'm');
			case 'password':
				return new RegExp('^(?=.*[\\d\\W]).{6,48}$', 'm');
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
						if (value.indexOf(control.value) !== -1) {
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

	getNavigationError(navigation: Navigation, error: any): void {
		const navigationCurrent: string = navigation.finalUrl.toString();
		const navigationPrevious: string = navigation.previousNavigation.finalUrl.toString();

		console.error('Error: ' + navigationPrevious + ' → ' + navigationCurrent, error);
	}
}
