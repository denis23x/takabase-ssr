/** @format */

import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PlatformService } from '../services/platform.service';

export const redirectLoadingGuard = (): CanMatchFn => {
	return (): Observable<boolean | UrlTree> => {
		const platformService: PlatformService = inject(PlatformService);
		const router: Router = inject(Router);

		if (platformService.isBrowser()) {
			return of(router.createUrlTree(['/error', 404]));
		}

		return of(true);
	};
};
