/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CategoryService, Category, CategoryGetAllDto } from '../../category/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchCategoriesResolverService {
  page = 1;
  size = 10;

  constructor(private router: Router, private categoryService: CategoryService) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Category[]> {
    let categoryGetAllDto: CategoryGetAllDto = {
      page: this.page,
      size: this.size,
      scope: ['user']
    };

    const { query: name = null } = activatedRouteSnapshot.parent.queryParams;

    if (name) {
      categoryGetAllDto = {
        ...categoryGetAllDto,
        name
      };
    }

    return this.categoryService.getAll(categoryGetAllDto).pipe(
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      })
    );
  }
}
