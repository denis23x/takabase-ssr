/** @format */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { AuthService, User } from '../../../core';
import { catchError, first, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-header, [appHeader]',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  user$: Observable<User>;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user$ = this.authService.user;
  }

  onLogout(): void {
    // prettier-ignore
    this.authService
      .onLogout()
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.authService.removeAuthorization().pipe(first()).subscribe(() => {
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
