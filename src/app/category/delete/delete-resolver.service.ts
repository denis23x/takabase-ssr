/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { Category, CategoryService } from '../core';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategoryDeleteResolverService {
  constructor(private router: Router, private categoryService: CategoryService) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<Category> {
    return this.categoryService.getOne(Number(activatedRouteSnapshot.paramMap.get('id'))).pipe(
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      })
    );
  }
}
