/** @format */

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { AuthService } from '../core';
import { SnackbarService } from '../../core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: SnackbarService
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated.pipe(
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
