/** @format */

import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { UserService } from '../core';

@Injectable()
export class NoAuthGuard implements CanActivate {
  constructor(private userService: UserService) {}

  canActivate(): Observable<boolean> {
    return this.userService.isAuthenticated.pipe(
      first(),
      map((isAuthenticated: boolean) => !isAuthenticated)
    );
  }
}
