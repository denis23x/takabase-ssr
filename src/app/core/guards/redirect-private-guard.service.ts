/** @format */

import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { from, Observable, of, switchMap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { PlatformService } from '../services/platform.service';
import { AuthorizationService } from '../services/authorization.service';
import { CurrentUser } from '../models/current-user.model';

export const redirectPrivateGuard = (): CanActivateFn => {
	return (activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<boolean | UrlTree> => {
		const authorizationService: AuthorizationService = inject(AuthorizationService);
		const platformService: PlatformService = inject(PlatformService);
		const router: Router = inject(Router);

		// prettier-ignore
		if (platformService.isBrowser()) {
			return authorizationService.getPopulate().pipe(
				map((currentUser: CurrentUser | undefined) => {
					return currentUser.name === activatedRouteSnapshot.paramMap.get('username') || router.createUrlTree(['/', currentUser.name]);
				}),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					return from(router.navigate(['/error', 401])).pipe(switchMap(() => throwError(() => httpErrorResponse)));
				})
			);
		}

		return of(router.createUrlTree(['/loading']));
	};
};
