/** @format */

import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { from, Observable, of, switchMap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PlatformService } from '../services/platform.service';
import { AuthorizationService } from '../services/authorization.service';
import { CookiesService } from '../services/cookies.service';
import type { CurrentUser } from '../models/current-user.model';
import type { HttpErrorResponse } from '@angular/common/http';

export const redirectHomeGuard = (): CanMatchFn => {
	return (): Observable<boolean | UrlTree> => {
		const authorizationService: AuthorizationService = inject(AuthorizationService);
		const platformService: PlatformService = inject(PlatformService);
		const cookiesService: CookiesService = inject(CookiesService);
		const router: Router = inject(Router);

		//! Browser only redirect
		if (platformService.isBrowser()) {
			return authorizationService.getPopulate().pipe(
				map((currentUser: CurrentUser | undefined) => {
					if (currentUser) {
						if (!!Number(cookiesService.getItem('page-redirect-home'))) {
							return router.createUrlTree(['/', currentUser.name]);
						}
					}

					return true;
				}),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					return from(router.navigate(['/error', 500])).pipe(switchMap(() => throwError(() => httpErrorResponse)));
				})
			);
		}

		return of(true);
	};
};
