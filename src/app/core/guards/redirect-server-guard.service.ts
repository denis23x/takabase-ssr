/** @format */

import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PlatformService } from '../services/platform.service';

export const redirectServerGuard = (): CanMatchFn => {
	return (): Observable<boolean | UrlTree> => {
		const platformService: PlatformService = inject(PlatformService);
		const router: Router = inject(Router);

		if (platformService.isServer()) {
			return of(router.createUrlTree(['/loading']));
		}

		return of(true);
	};
};
