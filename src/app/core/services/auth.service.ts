/** @format */

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, ReplaySubject, from } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
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
  agent: Observable<Agent>;

  userSubject = new BehaviorSubject<User>({} as User);
  user = this.userSubject.asObservable().pipe(distinctUntilChanged());

  isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private localStorageService: LocalStorageService
  ) {
    this.agent = from(FingerprintJS.load());
  }

  onLogin(loginDto: LoginDto): Observable<User> {
    return this.getFingerprint().pipe(
      switchMap((getResult: GetResult) => {
        return this.apiService
          .post('/auth/login', {
            ...loginDto,
            fingerprint: getResult.visitorId,
            scope: ['categories']
          })
          .pipe(tap((user: User) => this.setAuthorization(user)));
      })
    );
  }

  onLogout(logoutDto: LogoutDto): Observable<User> {
    return this.getFingerprint().pipe(
      switchMap((getResult: GetResult) => {
        return this.apiService
          .post('/auth/logout', {
            ...logoutDto,
            fingerprint: getResult.visitorId
          })
          .pipe(tap(() => this.removeAuthorization()));
      })
    );
  }

  onRegistration(registrationDto: RegistrationDto): Observable<User> {
    return this.apiService.post('/auth/registration', { ...registrationDto });
  }

  onRefresh(): Observable<User> {
    return this.getFingerprint().pipe(
      switchMap((getResult: GetResult) => {
        return this.apiService
          .post('/auth/refresh', { fingerprint: getResult.visitorId })
          .pipe(tap((user: User) => this.setAuthorization(user)));
      })
    );
  }

  getFingerprint(): Observable<GetResult> {
    return this.agent.pipe(switchMap((agent: Agent) => agent.get()));
  }

  getAuthorization(): void {
    if (this.localStorageService.getItem(environment.TOKEN_LOCALSTORAGE)) {
      this.apiService
        .get('/auth/me', {
          scope: ['categories']
        })
        .subscribe((user: User) => this.setAuthorization(user));
    } else {
      this.removeAuthorization();
    }
  }

  getMe(meDto: MeDto): Observable<User> {
    return this.apiService.get('/auth/me', { ...meDto });
  }

  setAuthorization(user: User): void {
    if (!!user.accessToken) {
      this.localStorageService.setItem(environment.TOKEN_LOCALSTORAGE, user.accessToken);
    }

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

  removeAuthorization(): void {
    this.userSubject.next({} as User);
    this.isAuthenticatedSubject.next(false);

    this.localStorageService.removeItem(environment.TOKEN_LOCALSTORAGE);
  }
}
