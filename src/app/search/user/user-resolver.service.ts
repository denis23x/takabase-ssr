/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { UserGetAllDto } from '../../core/dto/user/user-get-all.dto';

@Injectable({
	providedIn: 'root'
})
export class SearchUserResolverService {
	constructor(
		private router: Router,
		private userService: UserService
	) {}

	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<User[]> {
		let userGetAllDto: UserGetAllDto = {
			page: 1,
			size: 20
		};

		// prettier-ignore
		const query: string = String(activatedRouteSnapshot.parent.queryParamMap.get('query') || '');

		if (query.length) {
			userGetAllDto = {
				...userGetAllDto,
				query
			};
		}

		return this.userService.getAll(userGetAllDto).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
