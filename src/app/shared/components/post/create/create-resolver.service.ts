/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CategoryService, Category, CategoryGetAllDto } from '../../../../core';
import { Router } from '@angular/router';
import { catchError, first, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, User } from '../../../../core';

@Injectable({
  providedIn: 'root'
})
export class PostCreateResolverService {
  constructor(
    private router: Router,
    private authService: AuthService,
    private categoryService: CategoryService
  ) {}

  resolve(): Observable<Category[]> {
    return this.authService.user.pipe(first()).pipe(
      switchMap((user: User) => {
        const categoryGetAllDto: CategoryGetAllDto = {
          page: 1,
          size: 999,
          userId: user.id
        };

        return this.categoryService.getAll(categoryGetAllDto);
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
