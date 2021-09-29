/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { SearchDto, UserService, User } from '../../core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchUsersResolverService {
  page = 1;
  size = 10;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<User[]> {
    let searchDto: SearchDto = {
      page: this.page,
      size: this.size
    };

    const { query = null } = route.parent.queryParams;

    if (query) {
      searchDto = {
        ...searchDto,
        name: query
      };
    }

    return this.userService.getAll(searchDto).pipe(
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      })
    );
  }
}
