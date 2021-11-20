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
export class SearchCategoriesResolverService {
  constructor(private router: Router, private categoryService: CategoryService) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Category[]> {
    let categoryGetAllDto: CategoryGetAllDto = {
      page: 1,
      size: 10,
      scope: ['user']
    };

    const name = activatedRouteSnapshot.parent.queryParamMap.get('query');

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
