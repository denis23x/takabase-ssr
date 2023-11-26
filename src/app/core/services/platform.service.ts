/** @format */

import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

/**
 * Window provider is based on
 * https://juristr.com/blog/2016/09/ng2-get-window-ref/
 */

const getWindow = (): Window => window;

@Injectable({
	providedIn: 'root'
})
export class PlatformService {
	constructor(
		@Inject(PLATFORM_ID)
		private platformId: string
	) {}

	isBrowser(): boolean {
		return isPlatformBrowser(this.platformId);
	}

	isServer(): boolean {
		return isPlatformServer(this.platformId);
	}

	getWindow(): Window {
		return getWindow();
	}
}
