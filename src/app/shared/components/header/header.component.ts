/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { AuthService, User } from '../../../core';
import { catchError, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-header, [appHeader]',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  user$: Subscription;
  user: User;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user$ = this.authService.userSubject.subscribe({
      next: (user: User) => (this.user = user),
      error: (error: any) => console.error(error),
      complete: () => console.debug('Auth service user subscription complete')
    });
  }

  ngOnDestroy(): void {
    [this.user$].forEach($ => $?.unsubscribe());
  }

  onLogout(): void {
    this.authService
      .onLogout()
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.authService.removeAuthorization().subscribe({
            // prettier-ignore
            next: () => this.router.navigate(['/exception', error.status]).then(() => console.debug('Route changed')),
            error: (error: any) => console.error(error),
            complete: () => console.debug('Auth service remove authorization subscription complete')
          });

          return throwError(error);
        }),
        switchMap(() => this.authService.removeAuthorization())
      )
      .subscribe({
        next: () => this.router.navigateByUrl('/').then(() => console.debug('Route changed')),
        error: (error: any) => console.error(error),
        complete: () => console.debug('Auth service logout subscription complete')
      });
  }
}
