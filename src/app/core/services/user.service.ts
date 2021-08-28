/** @format */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { map, distinctUntilChanged, tap, pluck } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LocalStorageService } from './local-storage.service';
import { User } from '../models';
import { environment } from '../../../environments/environment';

@Injectable()
export class UserService {
  private uploadUrl: string = environment.upload_url;

  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) {}

  getAuthorization() {
    if (this.localStorageService.getItem('accessToken')) {
      this.apiService.get('/users/me').subscribe(user => this.setAuthorization(user));
    } else {
      this.removeAuthorization();
    }
  }

  getAuthentication(path: string, body: any, set: boolean = true): Observable<User> {
    return this.apiService.post(path, body).pipe(
      tap((user: User) => {
        if (set) {
          this.setAuthorization(user);
        }

        // @ts-ignore
        this.localStorageService.setItem('accessToken', user.accessToken);
      })
    );
  }

  setAuthorization(user: User) {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  removeAuthorization() {
    this.currentUserSubject.next({} as User);
    this.isAuthenticatedSubject.next(false);

    this.localStorageService.removeItem('accessToken');
  }

  update(user: any): Observable<User> {
    return this.apiService.put('/user', { user }).pipe(
      pluck('data'),
      tap((user: User) => this.currentUserSubject.next(user))
    );
  }

  getAll(params?: any): Observable<User[]> {
    return this.apiService.get('/users', params).pipe(
      map((userList: User[]) =>
        userList.map((user: User) => ({
          ...user,
          avatar: user.avatar ? `${this.uploadUrl}/${user.avatar}` : null
        }))
      )
    );
  }

  getById(id: number): Observable<User> {
    return this.apiService
      .get('/users/' + id)
      .pipe(
        map(user => ({ ...user, avatar: user.avatar ? `${this.uploadUrl}/${user.avatar}` : null }))
      );
  }
}
