/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, first, switchMap } from 'rxjs/operators';
import { UserService, User } from '../../core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UsersSettingsResolverService {
  constructor(private router: Router, private userService: UserService) {}

  resolve(): Observable<User> {
    return this.userService.user.pipe(
      first(),
      switchMap((user: User) => this.userService.getById(Number(user.id))),
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      })
    );
  }
}
