/** @format */

import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { CookieService } from './cookie.service';
import { LoginDto } from '../dto/auth/login.dto';
import { AppearanceService } from './appearance.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from './user.service';
import { UserCreateDto } from '../dto/user/user-create.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { ConnectDto } from '../dto/auth/connect.dto';
import firebase from 'firebase/compat';
import UserCredential = firebase.auth.UserCredential;

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	// prettier-ignore
	user: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);

	constructor(
		private apiService: ApiService,
		private cookieService: CookieService,
		private appearanceService: AppearanceService,
		private angularFireAuth: AngularFireAuth,
		private userService: UserService
	) {}

	/** Connect to backend */

	onAttach(userCredential: UserCredential): Observable<any> {
		const connectDto: ConnectDto = {
			uid: userCredential.user.uid,
			email: userCredential.user.email
		};

		return this.apiService.post('/authorization', connectDto);
	}

	onDetach(): Observable<any> {
		return this.apiService.delete('/authorization');
	}

	onVerify(): Observable<User> {
		return this.apiService
			.get('/authorization')
			.pipe(tap((user: User) => this.setUser(user)));
	}

	/** Authorization API */

	// prettier-ignore
	onRegistration(userCreateDto: UserCreateDto): Observable<User> {
		return from(this.angularFireAuth.createUserWithEmailAndPassword(
      userCreateDto.email,
      userCreateDto.password
    )).pipe(
      tap((userCredential: UserCredential) => userCredential.user.sendEmailVerification()),
      catchError((httpErrorResponse: HttpErrorResponse) => this.apiService.setError(httpErrorResponse)),
      switchMap((userCredential: UserCredential) => this.onAttach(userCredential)),
      switchMap(() => this.userService.create(userCreateDto)),
      switchMap(() => this.onLogin(userCreateDto as LoginDto))
    );
	}

	// prettier-ignore
	onLogin(loginDto: LoginDto): Observable<User> {
		return from(this.angularFireAuth.signInWithEmailAndPassword(
      loginDto.email,
      loginDto.password
    )).pipe(
      catchError((httpErrorResponse: HttpErrorResponse) => this.apiService.setError(httpErrorResponse)),
      switchMap((userCredential: UserCredential) => this.onAttach(userCredential)),
      switchMap(() => this.onVerify()),
    );
	}

	// prettier-ignore
	onLogout(): Observable<void> {
		return from(this.angularFireAuth.signOut()).pipe(
      catchError((httpErrorResponse: HttpErrorResponse) => this.apiService.setError(httpErrorResponse)),
			switchMap(() => this.onDetach()),
			tap(() => {
				this.user.next(undefined);

				this.appearanceService.setSettings(null);
			})
		);
	}

	/** App Service */

	getUser(): Observable<User | undefined> {
		const userInMemory: User | undefined = this.user.getValue();
		const userInCookie = (): User | undefined => {
			const cookie: string | undefined = this.cookieService.getItem('jwt-user');

			return cookie ? JSON.parse(cookie) : undefined;
		};

		return of(userInMemory || userInCookie() || undefined);
	}

	setUser(user: Partial<User>): Observable<User> {
		const userSaved: User = this.user.getValue();

		/** Set user */

		this.user.next({
			...userSaved,
			...user
		});

		/** Set settings */

		if (user.settings) {
			this.appearanceService.setSettings(user.settings);
		}

		return of(this.user.getValue());
	}
}
