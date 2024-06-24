/** @format */

import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { from, Observable, of, switchMap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { PlatformService } from '../services/platform.service';
import { AuthorizationService } from '../services/authorization.service';
import { CurrentUser } from '../models/current-user.model';
import { Request } from 'express';
import { CookiesService } from '../services/cookies.service';
import { REQUEST } from '../tokens/express.tokens';

export const redirectAuthGuard = (): CanMatchFn => {
	return (): Observable<boolean | UrlTree> => {
		const authorizationService: AuthorizationService = inject(AuthorizationService);
		const platformService: PlatformService = inject(PlatformService);
		const router: Router = inject(Router);
		const cookiesService: CookiesService = inject(CookiesService);
		const request: Request | null = inject(REQUEST, { optional: true });

		if (platformService.isBrowser()) {
			return authorizationService.getPopulate().pipe(
				map((currentUser: CurrentUser | undefined) => !currentUser || router.createUrlTree(['/', currentUser.name])),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					return from(router.navigate(['/error', 500])).pipe(switchMap(() => throwError(() => httpErrorResponse)));
				})
			);
		} else {
			//! Works only in production build
			if (request) {
				if (cookiesService.getItem('user-authed', request.headers.cookie)) {
					return of(router.createUrlTree(['/loading']));
				}
			}
		}

		return of(true);
	};
};
