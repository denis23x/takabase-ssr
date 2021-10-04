/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CategoryGetAllDto, CategoryService, Category } from '../../core';
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

  resolve(route: ActivatedRouteSnapshot): Observable<Category[]> {
    let categoryGetAllDto: CategoryGetAllDto = {
      page: this.page,
      size: this.size
    };

    const { query: title = null } = route.parent.queryParams;

    if (title) {
      categoryGetAllDto = {
        ...categoryGetAllDto,
        title
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
