/** @format */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { ApiService, LocalStorageService } from '../../../core';
import { User } from '../../../user/core';
import { environment } from '../../../../environments/environment';

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
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  getAuthentication(path: string, body: any, set: boolean = true): Observable<User> {
    return this.apiService.post(path, body).pipe(
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
      this.apiService.get('/users/me').subscribe(user => this.setAuthorization(user));
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
