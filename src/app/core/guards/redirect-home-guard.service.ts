/** @format */

import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { from, Observable, of, switchMap, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { PlatformService } from '../services/platform.service';
import { AuthorizationService } from '../services/authorization.service';
import { CurrentUser } from '../models/current-user.model';
import { CookiesService } from '../services/cookies.service';
import { environment } from '../../../environments/environment';
import { DOCUMENT } from '@angular/common';

export const redirectHomeGuard = (): CanMatchFn => {
	return (): Observable<boolean | UrlTree> => {
		const authorizationService: AuthorizationService = inject(AuthorizationService);
		const platformService: PlatformService = inject(PlatformService);
		const cookiesService: CookiesService = inject(CookiesService);
		const router: Router = inject(Router);
		const document: Document = inject(DOCUMENT);

		if (platformService.isBrowser()) {
			return authorizationService.getPopulate().pipe(
				map((currentUser: CurrentUser | undefined) => {
					if (currentUser) {
						const pageRedirectHome = (): boolean => {
							const url: URL = new URL(document.URL, environment.appUrl);

							const redirectName: string = 'page-redirect-home';
							const redirectCookie: boolean = !!Number(cookiesService.getItem(redirectName));
							const redirectSearchParams: boolean = !!url.searchParams.get(redirectName);

							return redirectCookie || redirectSearchParams;
						};

						if (pageRedirectHome()) {
							return router.createUrlTree(['/', currentUser.name]);
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
