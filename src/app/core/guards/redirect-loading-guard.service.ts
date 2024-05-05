/** @format */

import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PlatformService } from '../services/platform.service';

export const redirectLoadingGuard = (platform: string): CanMatchFn => {
	return (): Observable<boolean | UrlTree> => {
		const platformService: PlatformService = inject(PlatformService);
		const router: Router = inject(Router);

		// Avoid browser to go to loading page
		if (platform === 'browser') {
			if (platformService.isBrowser()) {
				return of(router.createUrlTree(['/error', 404]));
			}
		}

		// Avoid server to go to error page
		if (platform === 'server') {
			if (platformService.isServer()) {
				return of(router.createUrlTree(['/loading']));
			}
		}

		return of(true);
	};
};
