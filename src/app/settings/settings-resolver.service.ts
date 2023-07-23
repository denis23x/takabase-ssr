/** @format */

import { Injectable } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../core/services/user.service';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user.model';
import { UserGetOneDto } from '../core/dto/user/user-get-one.dto';

@Injectable({
	providedIn: 'root'
})
export class SettingsResolverService {
	constructor(
		private userService: UserService,
		private authService: AuthService,
		private router: Router
	) {}

	resolve(): Observable<User> {
		return this.authService.getUser().pipe(
			switchMap((user: User) => {
				const userGetOneDto: UserGetOneDto = {
					scope: ['sessions']
				};

				return this.userService.getOne(user.id, userGetOneDto);
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
