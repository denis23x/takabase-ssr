/** @format */

import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { from, Observable, of, switchMap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PlatformService } from '../services/platform.service';
import { AuthorizationService } from '../services/authorization.service';
import type { CurrentUser } from '../models/current-user.model';
import type { HttpErrorResponse } from '@angular/common/http';

export const redirectPasswordGuard = (): CanActivateFn => {
	return (activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<boolean | UrlTree> => {
		const authorizationService: AuthorizationService = inject(AuthorizationService);
		const platformService: PlatformService = inject(PlatformService);
		const router: Router = inject(Router);

		// prettier-ignore
		if (platformService.isBrowser()) {
			return authorizationService.getPopulate().pipe(
				map((currentUser: CurrentUser | null) => {
					return currentUser.displayName === activatedRouteSnapshot.paramMap.get('username') || router.createUrlTree(['/', currentUser.displayName]);
				}),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					return from(router.navigate(['/error', 401])).pipe(switchMap(() => throwError(() => httpErrorResponse)));
				})
			);
		}

		return of(router.createUrlTree(['/loading']));
	};
};
