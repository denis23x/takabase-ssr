/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { AuthService } from '../../auth/core';
import { User } from '../../core';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot): Observable<boolean> {
    return this.authService.userSubject.pipe(
      first(),
      switchMap((user: User) => {
        const userId = Number(activatedRouteSnapshot.paramMap.get('userId'));

        if (userId === user.id) {
          const categoryId: string = activatedRouteSnapshot.children
            .filter((snapshot: ActivatedRouteSnapshot) => snapshot.paramMap.get('categoryId'))
            .map((snapshot: ActivatedRouteSnapshot) => snapshot.paramMap.get('categoryId'))
            .shift();

          this.router
            .navigate(categoryId ? ['/profile/category', categoryId] : ['/profile'])
            .then(() => console.debug('Route changed'));

          return of(false);
        }

        return of(true);
      })
    );
  }
}
