/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { UserService, User, UserGetAllDto } from '../../core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchUserResolverService {
  constructor(private router: Router, private userService: UserService) {}

  resolve(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<User[]> {
    let userGetAllDto: UserGetAllDto = {
      page: 1,
      size: 10
    };

    const name: string = String(activatedRouteSnapshot.parent.queryParamMap.get('query') || '');

    if (!!name.length) {
      userGetAllDto = {
        ...userGetAllDto,
        name
      };
    }

    return this.userService.getAll(userGetAllDto).pipe(
      catchError((httpErrorResponse: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', httpErrorResponse.status])
          .then(() => console.debug('Route changed'));

        return throwError(() => httpErrorResponse);
      })
    );
  }
}
