/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, first, switchMap } from 'rxjs/operators';
import { AuthService } from '../../auth/core';
import { User, UserService } from '../core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UsersSettingsResolverService {
  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  resolve(): Observable<User> {
    return this.authService.user.pipe(
      first(),
      switchMap((user: User) => this.userService.findOneById(Number(user.id))),
      catchError((error: HttpErrorResponse) => {
        this.router
          .navigate(['/exception', error.status])
          .then(() => console.debug('Route was changed'));

        return throwError(error);
      })
    );
  }
}
