/** @format */

import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../core';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanLoad {
  constructor(private router: Router, private authService: AuthService) {}

  canLoad(): Observable<boolean> {
    return this.authService.isAuthenticated.pipe(
      first(),
      switchMap((isAuthenticated: boolean) => {
        if (isAuthenticated) {
          this.router.navigate(['/profile']).then(() => console.debug('Route was changed'));

          return of(false);
        }

        return of(true);
      })
    );
  }
}
