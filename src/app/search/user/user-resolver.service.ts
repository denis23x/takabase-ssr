/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { UserGetAllDto, UserService, User } from '../../core';
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

  resolve(route: ActivatedRouteSnapshot): Observable<User[]> {
    let userGetAllDto: UserGetAllDto = {
      page: this.page,
      size: this.size
    };

    const { query: name = null } = route.parent.queryParams;

    if (name) {
      userGetAllDto = {
        ...userGetAllDto,
        name
      };
    }

    return this.userService.findAll(userGetAllDto).pipe(
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      })
    );
  }
}
