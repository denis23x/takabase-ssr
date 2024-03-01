/** @format */

import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { PlatformService } from '../services/platform.service';
import { AuthorizationService } from '../services/authorization.service';
import { CurrentUser } from '../models/current-user.model';
import { UserService } from '../services/user.service';
import { CookieService } from '../services/cookie.service';

export const redirectHomeGuard = (): CanMatchFn => {
	return (): Observable<boolean | UrlTree> => {
		const authorizationService: AuthorizationService = inject(AuthorizationService);
		const platformService: PlatformService = inject(PlatformService);
		const userService: UserService = inject(UserService);
		const cookieService: CookieService = inject(CookieService);
		const router: Router = inject(Router);

		if (platformService.isBrowser()) {
			return authorizationService.onPopulate().pipe(
				map((currentUser: CurrentUser | undefined) => {
					if (currentUser) {
						const pageRedirectHome: boolean = !!Number(cookieService.getItem('page-redirect-home'));

						if (pageRedirectHome) {
							return router.createUrlTree([userService.getUserUrl(currentUser)]);
						}
					}

					return true;
				}),
				catchError((httpErrorResponse: HttpErrorResponse) => {
					router.navigate(['/error', 400]).then(() => console.debug('Route changed'));

					return throwError(() => httpErrorResponse);
				})
			);
		} else {
			return of(router.createUrlTree(['/loading']));
		}
	};
};
