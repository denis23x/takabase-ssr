/** @format */

import { inject, Injectable } from '@angular/core';
import { CustomProvider, ReCaptchaEnterpriseProvider } from '@angular/fire/app-check';
import { PlatformService } from '../services/platform.service';

@Injectable({
	providedIn: 'root'
})
export class RecaptchaBrowserProvider {
	private readonly platformService: PlatformService = inject(PlatformService);

	provider(siteKey: string): CustomProvider | ReCaptchaEnterpriseProvider {
		if (this.platformService.isBrowser()) {
			return new ReCaptchaEnterpriseProvider(siteKey);
		} else {
			return new CustomProvider({
				getToken: () => new Promise(() => {})
			});
		}
	}
}
