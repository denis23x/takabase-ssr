/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, throwError, zip } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  UserService,
  UserProfile,
  CategoryService,
  CategoryGetAllDto,
  User,
  UserGetAllDto
} from '../core';
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
    const name: string = activatedRouteSnapshot.parent.url[0].path;

    const userGetAllDto: UserGetAllDto = {
      name: name.substring(1),
      exact: 1
    };

    return this.userService.getAllByName(userGetAllDto).pipe(
      switchMap((user: User) => {
        const categoryGetAllDto: CategoryGetAllDto = {
          userId: user.id
        };

        return zip(of(user), this.categoryService.getAll(categoryGetAllDto));
      }),
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
