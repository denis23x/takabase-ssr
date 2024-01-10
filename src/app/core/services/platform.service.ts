/** @format */

import { inject, Injectable, PLATFORM_ID } from '@angular/core';
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
	private readonly platformId: any = inject(PLATFORM_ID);

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
