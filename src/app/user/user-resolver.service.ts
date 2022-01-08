/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, endWith, switchMap, tap } from 'rxjs/operators';
import { User, UserService, UserGetAllDto } from '../core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserResolverService {
  constructor(private userService: UserService, private router: Router) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<User> {
    const name: string = activatedRouteSnapshot.parent.url.shift().path;

    const userGetAllDto: UserGetAllDto = {
      name: name.substring(1),
      exact: 1,
      scope: ['categories']
    };

    return this.userService.getAll(userGetAllDto).pipe(
      switchMap((userList: User[]) => {
        if (!userList.length) {
          return throwError({
            status: 404,
            message: 'Not found'
          });
        }

        return of(userList.shift());
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
