/** @format */

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject, from, of } from 'rxjs';
import { distinctUntilChanged, first, switchMap, tap } from 'rxjs/operators';
import {
  ApiService,
  LoginDto,
  LogoutDto,
  RegistrationDto,
  LocalStorageService,
  User,
  UserService,
  MeDto
} from '../index';
import { environment } from '../../../environments/environment';
import FingerprintJS, { Agent, GetResult } from '@fingerprintjs/fingerprintjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  agent: Promise<Agent> = FingerprintJS.load();

  userSubject = new BehaviorSubject<User>({} as User);
  user = this.userSubject.asObservable().pipe(distinctUntilChanged());

  isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private localStorageService: LocalStorageService
  ) {}

  onLogin(loginDto: LoginDto): Observable<User> {
    return this.getFingerprint().pipe(
      switchMap((fingerprint: string) => {
        return this.apiService
          .post('/auth/login', {
            ...loginDto,
            fingerprint,
            scope: ['categories', 'settings']
          })
          .pipe(tap((user: User) => this.setAuthorization(user)));
      })
    );
  }

  onLogout(logoutDto?: LogoutDto): Observable<User> {
    return this.getFingerprint().pipe(
      switchMap((fingerprint: string) => {
        return this.apiService.post('/auth/logout', {
          ...logoutDto,
          fingerprint
        });
      })
    );
  }

  onRegistration(registrationDto: RegistrationDto): Observable<User> {
    return this.apiService.post('/auth/registration', { ...registrationDto });
  }

  onRefresh(): Observable<User> {
    return this.getFingerprint().pipe(
      switchMap((fingerprint: string) => {
        return this.apiService
          .post('/auth/refresh', { fingerprint })
          .pipe(tap((user: User) => this.setAuthorization(user)));
      })
    );
  }

  getFingerprint(): Observable<string> {
    return from(this.agent.then((agent: Agent) => agent.get())).pipe(
      switchMap((getResult: GetResult) => {
        const { platform, timezone, vendor } = getResult.components;

        return of(FingerprintJS.hashComponents({ platform, timezone, vendor }));
      })
    );
  }

  getAuthorization(): void {
    if (this.localStorageService.getItem(environment.USER_ACCESS_TOKEN_LOCALSTORAGE)) {
      this.apiService
        .get('/auth/me', {
          scope: ['categories']
        })
        .subscribe((user: User) => this.setAuthorization(user));
    } else {
      this.removeAuthorization().pipe(first());
    }
  }

  getMe(meDto: MeDto): Observable<User> {
    return this.apiService.get('/auth/me', { ...meDto });
  }

  setAuthorization(user: User): void {
    if (!!user.accessToken) {
      // prettier-ignore
      this.localStorageService.setItem(environment.USER_ACCESS_TOKEN_LOCALSTORAGE, user.accessToken);
    }

    if (!!user.settings) {
      // prettier-ignore
      this.localStorageService.setItem(environment.USER_SETTINGS_LOCALSTORAGE, JSON.stringify(user.settings));
    }

    this.userSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  removeAuthorization(): Observable<void> {
    this.userSubject.next({} as User);
    this.isAuthenticatedSubject.next(false);

    this.localStorageService.removeItem(environment.USER_ACCESS_TOKEN_LOCALSTORAGE);

    return of(null);
  }
}
