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
    this.user$ = this.authService.user.subscribe({
      next: (user: User) => (this.user = user),
      error: (error: any) => console.error(error)
    });
  }

  ngOnDestroy(): void {
    [this.user$].forEach($ => $?.unsubscribe());
  }

  onLogout(): void {
    this.authService
      .onLogout()
      .pipe(
        catchError((httpErrorResponse: HttpErrorResponse) => {
          this.authService.removeAuthorization().subscribe({
            // prettier-ignore
            next: () => this.router.navigate(['/exception', httpErrorResponse.status]).then(() => console.debug('Route changed')),
            error: (error: any) => console.error(error)
          });

          return throwError(() => httpErrorResponse);
        }),
        switchMap(() => this.authService.removeAuthorization())
      )
      .subscribe({
        next: () => this.router.navigateByUrl('/').then(() => console.debug('Route changed')),
        error: (error: any) => console.error(error)
      });
  }
}
