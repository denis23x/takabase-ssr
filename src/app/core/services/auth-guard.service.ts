/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { UserService } from './user.service';
import { SnackbarService } from './snackbar.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService,
    private notificationService: SnackbarService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.userService.isAuthenticated.pipe(
      take(1),
      tap(isAuthenticated => {
        if (!isAuthenticated) {
          this.notificationService.warning('Unauthorized', 'Login to continue');
          this.router.navigate(['/login']).then();
        }
      })
    );
  }
}
