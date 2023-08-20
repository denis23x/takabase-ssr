/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { CategoryGetAllDto } from '../../core/dto/category/category-get-all.dto';

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

		const query: string = String(activatedRouteSnapshot.parent.queryParamMap.get('query') || '');

		if (query.length) {
			categoryGetAllDto = {
				...categoryGetAllDto,
				query
			};
		}

		return this.categoryService.getAll(categoryGetAllDto).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', httpErrorResponse.status])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}
}
