/** @format */

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { UserService, User } from '../../core';

@Injectable({
  providedIn: 'root'
})
export class UsersSettingsResolverService {
  constructor(private router: Router, private userService: UserService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    return this.userService.currentUser.pipe(
      take(1),
      switchMap(currentUser => this.userService.getById(Number(currentUser.id)))
    );
  }
}
