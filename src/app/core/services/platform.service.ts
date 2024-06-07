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

	isMobile(): boolean {
		if (this.isBrowser()) {
			const window: Window = this.getWindow();

			/** http://detectmobilebrowsers.com */

			// prettier-ignore
			const regExp: RegExp = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;

			// @ts-ignore
			return regExp.test(navigator.userAgent || navigator.vendor || window.opera);
		}

		return false;
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
				case macos.indexOf(platform) !== -1:
					return 'Mac';
				case windows.indexOf(platform) !== -1:
					return 'Windows';
				case ios.indexOf(platform) !== -1:
					return 'iOS';
				case /Android/.test(userAgent):
					return 'Android';
				case /Linux/.test(userAgent):
					return 'Linux';
				default:
					return null;
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

	getOSKeyboardCharacter(key: string): string {
		const os: string = this.getOS();

		if (os === 'Mac') {
			switch (key) {
				case 'ctrl':
					return '⌃';
				case 'command':
					return '⌘';
				case 'alt':
					return '⌥';
				case 'shift':
					return '⇧';
				case 'enter':
					return '↵';
				default:
					return key;
			}
		}

		return key;
	}
}
