/** @format */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import {
  ApiService,
  AuthLoginDto,
  AuthRegistrationDto,
  LocalStorageService,
  User,
  UserGetOneDto,
  UserService
} from '../index';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public userSubject = new BehaviorSubject<User>({} as User);
  public user = this.userSubject.asObservable().pipe(distinctUntilChanged());

  public isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  getAuthentication(
    path: string,
    authenticationDto: AuthLoginDto | AuthRegistrationDto,
    set: boolean = true
  ): Observable<User> {
    return this.apiService.post(path, { ...authenticationDto }).pipe(
      tap((user: User) => {
        if (set) {
          this.setAuthorization(user);
        }

        this.localStorageService.setItem(environment.TOKEN_LOCALSTORAGE, user.accessToken);
      })
    );
  }

  getAuthorization() {
    if (this.localStorageService.getItem(environment.TOKEN_LOCALSTORAGE)) {
      const userGetOneDto: UserGetOneDto = {
        scope: ['categories']
      };

      this.userService
        .getProfile(userGetOneDto)
        .subscribe((user: User) => this.setAuthorization(user));
    } else {
      this.removeAuthorization();
    }
  }

  setAuthorization(user: User) {
    const config = this.localStorageService.getItem(environment.CONFIG_LOCALSTORAGE);

    if (config) {
      user = {
        ...user,
        interfaceConfig: JSON.parse(config)
      };
    }

    this.userSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  removeAuthorization() {
    this.userSubject.next({} as User);
    this.isAuthenticatedSubject.next(false);

    this.localStorageService.removeItem(environment.TOKEN_LOCALSTORAGE);
  }
}
