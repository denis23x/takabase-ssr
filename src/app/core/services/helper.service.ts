/** @format */

import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PlatformService } from './platform.service';

@Injectable({
	providedIn: 'root'
})
export class HelperService {
	constructor(private platformService: PlatformService) {}

	getRegex(regex: string, payload?: any): RegExp {
		// prettier-ignore
		switch (regex) {
			case 'exact':
				return new RegExp('^' + payload + '$', 'm');
			case 'password':
				return new RegExp('^((?=.*\\d)|(?=.*[!@#$%^&*]))(?=.*[a-zA-Z]).{6,32}$', 'm');
      case 'url':
				return new RegExp('^(https?|chrome|ftp):\\/\\/[^\\s$.?#].[^\\s]*$', 'm');
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
}
