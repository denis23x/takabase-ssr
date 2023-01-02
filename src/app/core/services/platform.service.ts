/** @format */

import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Window provider is based on
 * https://juristr.com/blog/2016/09/ng2-get-window-ref/
 */

const getWindow = (): Window => window;

@Injectable()
export class PlatformService {
	constructor(
		@Inject(PLATFORM_ID)
		private platformId: string
	) {}

	isBrowser(): boolean {
		return isPlatformBrowser(this.platformId);
	}

	getWindow(): Window {
		return getWindow();
	}
}
