/** @format */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { UserService, User } from '../../core';

@Injectable({
  providedIn: 'root'
})
export class UsersSettingsResolverService {
  constructor(private userService: UserService) {}

  resolve(): Observable<User> {
    return this.userService.user.pipe(
      first(),
      switchMap((user: User) => this.userService.getById(Number(user.id)))
    );
  }
}
