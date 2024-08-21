/** @format */

import { Injectable } from '@angular/core';
import { PlatformService } from './platform.service';

@Injectable({
	providedIn: 'root'
})
export class LocalStorageService {
	constructor(private platformService: PlatformService) {}

	getItem(item: string): string {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			return window.localStorage.getItem(item);
		}

		return '';
	}

	setItem(key: string, value: string): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			window.localStorage.setItem(key, value);
		}
	}

	removeItem(item: string): void {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			window.localStorage.removeItem(item);
		}
	}
}
