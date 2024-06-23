/** @format */

import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PlatformService } from '../services/platform.service';
import { ApiService } from '../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';

export const redirectHttpErrorGuard = (): CanMatchFn => {
	return (): Observable<boolean | UrlTree> => {
		const apiService: ApiService = inject(ApiService);
		const platformService: PlatformService = inject(PlatformService);
		const router: Router = inject(Router);

		if (platformService.isBrowser()) {
			const httpErrorResponse: HttpErrorResponse | undefined = apiService.getHttpErrorResponseKey();

			if (httpErrorResponse) {
				apiService.removeHttpErrorResponseKey();

				return of(router.createUrlTree(['/error', httpErrorResponse.status]));
			}
		}

		return of(true);
	};
};
