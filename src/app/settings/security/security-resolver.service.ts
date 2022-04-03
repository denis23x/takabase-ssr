/** @format */

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService, User } from '../../core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SettingsSecurityResolverService {
  constructor(private authService: AuthService, private router: Router) {}

  resolve(): Observable<User> {
    return this.authService
      .getMe({
        scope: ['sessions']
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.router
            .navigate(['/exception', error.status])
            .then(() => console.debug('Route was changed'));

          return throwError(error);
        })
      );
  }
}
