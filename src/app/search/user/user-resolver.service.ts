/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { UserService, User, UserGetAllDto } from '../../user/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchUsersResolverService {
  page = 1;
  size = 10;

  constructor(private router: Router, private userService: UserService) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<User[]> {
    let userGetAllDto: UserGetAllDto = {
      page: this.page,
      size: this.size
    };

    const { query: name = null } = activatedRouteSnapshot.parent.queryParams;

    if (name) {
      userGetAllDto = {
        ...userGetAllDto,
        name
      };
    }

    return this.userService.getAll(userGetAllDto).pipe(
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      })
    );
  }
}
