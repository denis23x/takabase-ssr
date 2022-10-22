/** @format */

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import {
  ApiService,
  LoginDto,
  LogoutDto,
  RegistrationDto,
  LocalStorageService,
  User,
  UserService,
  MeDto,
  PlatformService
} from '../index';
import { environment } from '../../../environments/environment';
import FingerprintJS, { Agent, GetResult } from '@fingerprintjs/fingerprintjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  agent: Promise<Agent> = FingerprintJS.load();

  userSubject: BehaviorSubject<User> = new BehaviorSubject<User>({} as User);
  userAuthenticated: Observable<boolean> = this.userSubject
    .asObservable()
    .pipe(switchMap((user: User) => of(!!Object.keys(user).length)));

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private localStorageService: LocalStorageService,
    private platformService: PlatformService
  ) {}

  onLogin(loginDto: LoginDto): Observable<User> {
    return this.getFingerprint().pipe(
      switchMap((fingerprint: string) => {
        return this.apiService
          .post('/auth/login', {
            ...loginDto,
            fingerprint,
            scope: ['settings']
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
    return this.apiService.post('/auth/registration', registrationDto);
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
    if (this.localStorageService.getItem(environment.USER_ACCESS_TOKEN)) {
      this.apiService.get('/auth/me', { scope: ['settings'] }).subscribe({
        next: (user: User) => this.setAuthorization(user),
        error: (error: any) => console.error(error)
      });
    } else {
      this.removeAuthorization();
    }
  }

  getMe(meDto: MeDto): Observable<User> {
    return this.apiService.get('/auth/me', meDto);
  }

  setAuthorization(user: User): Observable<void> {
    this.userSubject.next(user);

    if (!!user.accessToken) {
      this.localStorageService.setItem(environment.USER_ACCESS_TOKEN, user.accessToken);
    }

    if (!!user.settings) {
      this.platformService.setSettings(this.userSubject.getValue());
    }

    return of(null);
  }

  removeAuthorization(): Observable<void> {
    this.localStorageService.removeItem(environment.USER_ACCESS_TOKEN);
    this.platformService.removeSettings(this.userSubject.getValue());

    this.userSubject.next({} as User);

    return of(null);
  }
}
