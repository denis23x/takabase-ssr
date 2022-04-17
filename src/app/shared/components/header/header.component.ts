/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, throwError } from 'rxjs';
import { AuthService, User } from '../../../core';
import { catchError, first, switchMap } from 'rxjs/operators';
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
    this.user$ = this.authService.userSubject.subscribe((user: User) => (this.user = user));
  }

  ngOnDestroy(): void {
    [this.user$].forEach($ => $?.unsubscribe());
  }

  onLogout(): void {
    // prettier-ignore
    this.authService
      .onLogout()
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.authService.removeAuthorization().subscribe(() => {
            this.router
              .navigate(['/exception', error.status])
              .then(() => console.debug('Route was changed'));
          });

          return throwError(error);
        }),
        switchMap(() => this.authService.removeAuthorization())
      )
      .subscribe(() => this.router.navigateByUrl('/').then(() => console.debug('Route changed')));
  }
}
