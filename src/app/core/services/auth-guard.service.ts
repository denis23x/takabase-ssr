/** @format */

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { UserService } from './user.service';
import { SnackbarService } from './snackbar.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService,
    private notificationService: SnackbarService
  ) {}

  canActivate(): Observable<boolean> {
    return this.userService.isAuthenticated.pipe(
      first(),
      tap(isAuthenticated => {
        if (!isAuthenticated) {
          this.router
            .navigate(['/login'])
            .then(() => this.notificationService.warning('Unauthorized', 'Login to continue'));
        }
      })
    );
  }
}
