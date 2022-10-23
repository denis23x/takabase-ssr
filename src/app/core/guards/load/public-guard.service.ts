/** @format */

import { Injectable } from '@angular/core';
import { CanLoad } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services';

@Injectable({
  providedIn: 'root'
})
export class CanLoadPublicGuard implements CanLoad {
  constructor(private authService: AuthService) {}

  canLoad(): Observable<boolean> {
    return this.authService.guardPublic();
  }
}
