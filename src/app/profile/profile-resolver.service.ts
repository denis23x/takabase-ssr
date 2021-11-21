/** @format */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError, zip } from 'rxjs';
import { catchError, first, map, switchMap } from 'rxjs/operators';
import { AuthService, UserProfile, User, CategoryService } from '../core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProfileResolverService {
  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  resolve(): Observable<UserProfile> {
    return this.authService.userSubject.pipe(
      first(),
      switchMap((user: User) => zip(of(user), this.categoryService.getAll({ userId: user.id }))),
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
