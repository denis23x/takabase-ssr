/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { forkJoin, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService, UserProfile, CategoryService, CategoryGetAllDto } from '../core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserResolverService {
  constructor(
    private userService: UserService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<UserProfile> {
    const userId: number = Number(activatedRouteSnapshot.paramMap.get('userId'));

    const categoryGetAllDto: CategoryGetAllDto = {
      userId
    };

    return forkJoin([
      this.userService.getOne(userId),
      this.categoryService.getAll(categoryGetAllDto)
    ]).pipe(
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      }),
      map(([user, categoryList]) => ({ user, categoryList }))
    );
  }
}
