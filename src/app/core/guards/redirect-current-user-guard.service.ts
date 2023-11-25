/** @format */

import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { Observable, throwError } from 'rxjs';
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

		return authorizationService.onPopulate().pipe(
			map((currentUser: CurrentUser | undefined) => {
				if (platformService.isBrowser()) {
					if (!!currentUser === currentUserState) {
						return router.createUrlTree(['/error', 404]);
					}
				}

				return true;
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				router.navigate(['/error', 400]).then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	};
};
