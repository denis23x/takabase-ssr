/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlSegment } from '@angular/router';
import { Observable, of, throwError, zip } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import {
	User,
	UserService,
	UserGetAllDto,
	CategoryService,
	CategoryGetAllDto,
	Category
} from '../core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class UserResolverService {
	constructor(
		private userService: UserService,
		private categoryService: CategoryService,
		private router: Router
	) {}

	// prettier-ignore
	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<[User, Category[]]> {
		const [path]: UrlSegment[] = activatedRouteSnapshot.parent.url;

		const name: string = path.path;

		const userGetAllDto: UserGetAllDto = {
			name: name.substring(1),
			exact: 1
		};

		return this.userService.getAll(userGetAllDto).pipe(
			switchMap((userList: User[]) => {
				if (!userList.length) {
					return throwError(() => {
						return {
							status: 404,
							message: 'Not found'
						};
					});
				}

				return of(userList.shift());
			}),
			switchMap((user: User) => {
				const categoryGetAllDto: CategoryGetAllDto = {
					userId: user.id,
					page: 1,
					size: 999
				};

				return zip(of(user), this.categoryService.getAll(categoryGetAllDto));
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/exception', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
