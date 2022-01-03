/** @format */

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class CanActivatePublicGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): Observable<boolean> {
    return this.authService.isAuthenticated.pipe(
      first(),
      switchMap((isAuthenticated: boolean) => {
        if (isAuthenticated) {
          this.router.navigate(['/exception/423']).then(() => console.debug('Route was changed'));

          return of(false);
        }

        return of(true);
      })
    );
  }
}
