/** @format */

import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class CanActivatePrivateGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(): Observable<boolean> {
    return this.authService.guardPrivate();
  }
}
