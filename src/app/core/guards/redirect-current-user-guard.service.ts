/** @format */

import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { from, Observable, of, switchMap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { PlatformService } from '../services/platform.service';
import { AuthorizationService } from '../services/authorization.service';
import { CurrentUser } from '../models/current-user.model';

export const redirectCurrentUserGuard = (currentUserState: boolean): CanMatchFn => {
	return (): Observable<boolean | UrlTree> => {
		const authorizationService: AuthorizationService = inject(AuthorizationService);
		const platformService: PlatformService = inject(PlatformService);
		const router: Router = inject(Router);

		if (platformService.isBrowser()) {
			return authorizationService.getPopulate().pipe(
				map((currentUser: CurrentUser | undefined) => {
					if (!!currentUser !== currentUserState) {
						if (currentUser) {
							return router.createUrlTree(['/error', 404]);
						} else {
							return router.createUrlTree(['/login']);
						}
					}

					return true;
				}),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					return from(router.navigate(['/error', 400])).pipe(switchMap(() => throwError(() => httpErrorResponse)));
				})
			);
		} else {
			return of(router.createUrlTree(['/loading']));
		}
	};
};
