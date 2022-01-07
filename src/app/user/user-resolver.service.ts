/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User, UserService, UserGetAllDto } from '../core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserResolverService {
  constructor(private userService: UserService, private router: Router) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<User> {
    const name: string = activatedRouteSnapshot.parent.url[0].path;

    const userGetAllDto: UserGetAllDto = {
      name: name.substring(1),
      exact: 1,
      scope: ['categories']
    };

    return this.userService.getAllByName(userGetAllDto).pipe(
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      })
    );
  }
}
