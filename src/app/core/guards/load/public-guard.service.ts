/** @format */

import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService, SnackbarService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class CanLoadPublicGuard implements CanLoad {
  constructor(
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {}

  canLoad(): Observable<boolean> {
    return this.authService.userAuthenticated.pipe(
      switchMap((userAuthenticated: boolean) => {
        if (userAuthenticated) {
          this.router.navigate(['/exception', 403]).then(() => {
            this.snackbarService.warning('Access denied', {
              title: 'Forbidden'
            });
          });

          return of(false);
        }

        return of(true);
      })
    );
  }
}
