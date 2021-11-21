/** @format */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, first, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, Category, CategoryGetAllDto, CategoryService, User } from '../core';

@Injectable({
  providedIn: 'root'
})
export class CreateResolverService {
  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  resolve(): Observable<Category[]> {
    return this.authService.userSubject.pipe(
      first(),
      switchMap((user: User) => {
        const categoryGetAllDto: CategoryGetAllDto = {
          userId: user.id
        };

        return this.categoryService.getAll(categoryGetAllDto);
      }),
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      })
    );
  }
}
