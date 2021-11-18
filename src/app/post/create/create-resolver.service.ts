/** @format */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Category, CategoryService } from '../../category/core';
import { User, UserService } from '../../user/core';

@Injectable({
  providedIn: 'root'
})
export class PostCreateResolverService {
  constructor(
    private userService: UserService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  resolve(): Observable<Category[]> {
    return this.userService.getProfile().pipe(
      switchMap((user: User) => this.categoryService.getAll({ userId: user.id })),
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      })
    );
  }
}
