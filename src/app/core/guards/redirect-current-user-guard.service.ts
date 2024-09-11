/** @format */

import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { from, Observable, of, switchMap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PlatformService } from '../services/platform.service';
import { AuthorizationService } from '../services/authorization.service';
import type { CurrentUser } from '../models/current-user.model';
import type { HttpErrorResponse } from '@angular/common/http';

export const redirectCurrentUserGuard = (): CanMatchFn => {
	return (): Observable<boolean | UrlTree> => {
		const authorizationService: AuthorizationService = inject(AuthorizationService);
		const platformService: PlatformService = inject(PlatformService);
		const router: Router = inject(Router);

		if (platformService.isBrowser()) {
			return authorizationService.getPopulate().pipe(
				map((currentUser: CurrentUser | null) => !!currentUser || router.createUrlTree(['/login'])),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					return from(router.navigate(['/error', 401])).pipe(switchMap(() => throwError(() => httpErrorResponse)));
				})
			);
		}

		return of(router.createUrlTree(['/loading']));
	};
};
