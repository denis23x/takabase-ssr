/** @format */

import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { AuthService, SnackbarService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class CanLoadRestrictGuard implements CanLoad {
  constructor(
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {}

  canLoad(): Observable<boolean> {
    return this.authService.userAuthenticated.pipe(
      first(),
      switchMap((isAuthenticated: boolean) => {
        if (!isAuthenticated) {
          this.router.navigate(['/exception', 401]).then(() =>
            this.snackbarService.warning('Login to continue', {
              title: 'Unauthorized'
            })
          );

          return of(false);
        }

        return of(true);
      })
    );
  }
}
