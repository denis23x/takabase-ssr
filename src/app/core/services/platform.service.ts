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

	getOS(): string | null {
		if (this.isBrowser()) {
			const window: Window = this.getWindow();

			const userAgent: string = window.navigator.userAgent;

			// @ts-ignore
			const platformExperimental: string = window.navigator?.userAgentData?.platform;
			const platformLegacy: string = window.navigator.platform;
			const platform: string = platformLegacy || platformExperimental;

			const macos: string[] = ['macOS', 'Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
			const windows: string[] = ['Win32', 'Win64', 'Windows', 'WinCE'];
			const ios: string[] = ['iPhone', 'iPad', 'iPod'];

			switch (true) {
				case macos.indexOf(platform) !== -1: {
					return 'Mac';
				}
				case windows.indexOf(platform) !== -1: {
					return 'Windows';
				}
				case ios.indexOf(platform) !== -1: {
					return 'iOS';
				}
				case /Android/.test(userAgent): {
					return 'Android';
				}
				case /Linux/.test(userAgent): {
					return 'Linux';
				}
				default: {
					return null;
				}
			}
		}

		return null;
	}

	getOSModifierKey(): string {
		const os: string = this.getOS();

		if (os === 'Mac') {
			return 'command';
		} else {
			return 'ctrl';
		}
	}
}
