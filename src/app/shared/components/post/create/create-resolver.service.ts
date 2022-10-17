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
    return this.authService.userSubject.pipe(first()).pipe(
      switchMap((user: User) => {
        const categoryGetAllDto: CategoryGetAllDto = {
          page: 1,
          size: 999,
          userId: user.id
        };

        return this.categoryService.getAll(categoryGetAllDto);
      }),
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route changed'));

        return throwError(() => new Error('Post create resolver error'));
      })
    );
  }
}
