/** @format */

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import {
  ApiService,
  LoginDto,
  LogoutDto,
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
  user: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);
  userAuthenticated: Observable<boolean> = this.user
    .asObservable()
    .pipe(switchMap((user: User) => of(!!user)));

  userAgent: Promise<Agent> = FingerprintJS.load();

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
    return from(this.userAgent.then((agent: Agent) => agent.get())).pipe(
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
    this.user.next(user);

    if (!!user.accessToken) {
      this.localStorageService.setItem(environment.USER_ACCESS_TOKEN, user.accessToken);
    }

    if (!!user.settings) {
      this.platformService.setSettings(this.user.getValue());
    }

    return of(null);
  }

  removeAuthorization(): Observable<void> {
    this.localStorageService.removeItem(environment.USER_ACCESS_TOKEN);
    this.platformService.removeSettings(this.user.getValue());

    this.user.next(undefined);

    return of(null);
  }
}
