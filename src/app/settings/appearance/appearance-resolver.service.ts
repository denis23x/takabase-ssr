/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import { Settings } from '../../core/models/settings.model';

@Injectable({
	providedIn: 'root'
})
export class SettingsAppearanceResolverService {
	constructor(
		private settingsService: SettingsService,
		private router: Router
	) {}

	resolve(): Observable<Settings> {
		return this.settingsService.getOne().pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
