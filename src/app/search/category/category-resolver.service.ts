/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CategoryService, Category, CategoryGetAllDto } from '../../core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class SearchCategoryResolverService {
	constructor(
		private router: Router,
		private categoryService: CategoryService
	) {}

	// prettier-ignore
	resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Category[]> {
		let categoryGetAllDto: CategoryGetAllDto = {
			page: 1,
			size: 20,
			scope: ['user']
		};

		const name: string = String(activatedRouteSnapshot.parent.queryParamMap.get('query') || '');

		if (!!name.length) {
			categoryGetAllDto = {
				...categoryGetAllDto,
				name
			};
		}

		return this.categoryService.getAll(categoryGetAllDto).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/exception', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
