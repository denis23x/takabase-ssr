/** @format */

import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, from, Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { CookieService } from './cookie.service';
import { LoginDto } from '../dto/auth/login.dto';
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
		private angularFireAuth: AngularFireAuth,
		private userService: UserService
	) {}

	/** Authorization API */

	onRegistration(userCreateDto: UserCreateDto): Observable<User> {
		return from(
			this.angularFireAuth.createUserWithEmailAndPassword(
				userCreateDto.email,
				userCreateDto.password
			)
		).pipe(
			tap((userCredential: UserCredential) => {
				userCredential.user.sendEmailVerification();
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			}),
			switchMap((userCredential: UserCredential) => {
				return this.onAttach(userCredential);
			}),
			switchMap(() => this.userService.create(userCreateDto)),
			switchMap(() => this.onLogin(userCreateDto as LoginDto))
		);
	}

	onLogin(loginDto: LoginDto): Observable<User> {
		return from(
			this.angularFireAuth.signInWithEmailAndPassword(
				loginDto.email,
				loginDto.password
			)
		).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			}),
			switchMap((userCredential: UserCredential) => {
				return this.onAttach(userCredential);
			}),
			switchMap(() => {
				return this.getCurrentUserFromServer();
			})
		);
	}

	onLogout(): Observable<void> {
		return from(this.angularFireAuth.signOut()).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			}),
			switchMap(() => this.onDetach()),
			tap(() => {
				this.user.next(undefined);
				this.cookieService.removeItem('jwt-user');
			})
		);
	}

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

	/** Current User */

	getCurrentUserFromServer(): Observable<User> {
		return this.apiService
			.get('/authorization')
			.pipe(switchMap((user: User) => this.setCurrentUser(user)));
	}

	getCurrentUser(): Observable<User | undefined> {
		const userInMemory: User | undefined = this.user.getValue();
		const userInCookie = (): User | undefined => {
			const cookie: string | undefined = this.cookieService.getItem('jwt-user');

			return cookie ? JSON.parse(cookie) : undefined;
		};

		return of(userInMemory || userInCookie() || undefined);
	}

	setCurrentUser(user: User): Observable<User> {
		return forkJoin([
			from(this.angularFireAuth.currentUser).pipe(
				map((userInFirebase: firebase.User) => ({
					email: userInFirebase.email,
					emailConfirmed: userInFirebase.emailVerified
				}))
			),
			this.getCurrentUser()
		]).pipe(
			switchMap(
				([userInFirebase, userInApp]: [Partial<firebase.User>, User]) => {
					this.user.next({
						...userInFirebase,
						...userInApp,
						...user
					});

					return of(this.user.getValue());
				}
			),
			tap((user: User) => {
				const dateNow: Date = new Date();

				/** Set 5 minutes cookie */

				this.cookieService.setItem('jwt-user', JSON.stringify(user), {
					expires: new Date(dateNow.setTime(dateNow.getTime() + 60 * 60 * 1000))
				});
			})
		);
	}
}
