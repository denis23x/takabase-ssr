/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SessionService } from '../../core/services/session.service';
import { Session } from '../../core/models/session.model';

@Injectable({
	providedIn: 'root'
})
export class SettingsSecurityResolverService {
	constructor(
		private sessionService: SessionService,
		private router: Router
	) {}

	resolve(): Observable<Session[]> {
		return this.sessionService.getAll().pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
