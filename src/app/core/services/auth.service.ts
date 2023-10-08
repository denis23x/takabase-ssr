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
import { RegistrationDto } from '../dto/auth/registration.dto';
import firebase from 'firebase/compat';

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

	onRegistration(registrationDto: RegistrationDto): Observable<User> {
		return from(
			this.angularFireAuth.createUserWithEmailAndPassword(
				registrationDto.email,
				registrationDto.password
			)
		).pipe(
			switchMap((userCredential: firebase.auth.UserCredential) => {
				return from(userCredential.user.sendEmailVerification()).pipe(
					switchMap(() => {
						return of(userCredential);
					})
				);
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			}),
			switchMap((userCredential: firebase.auth.UserCredential) => {
				const userCreateDto: UserCreateDto = {
					firebaseId: userCredential.user.uid,
					name: registrationDto.name,
					terms: registrationDto.terms
				};

				return this.userService.create(userCreateDto);
			}),
			switchMap(() => this.onLogin(registrationDto))
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
			switchMap((userCredential: firebase.auth.UserCredential) => {
				const connectDto: ConnectDto = {
					firebaseId: userCredential.user.uid
				};

				return this.onAttach(connectDto);
			})
		);
	}

	onLogout(): Observable<void> {
		return from(this.angularFireAuth.signOut()).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			}),
			switchMap(() => this.onDetach())
		);
	}

	/** Connect to backend */

	onAttach(connectDto: ConnectDto): Observable<User> {
		return this.apiService
			.post('/authorization', connectDto)
			.pipe(switchMap((user: User) => this.setCurrentUser(user)));
	}

	onDetach(): Observable<any> {
		return this.apiService.delete('/authorization').pipe(
			tap(() => {
				this.user.next(undefined);
				this.cookieService.removeItem('jwt-user');
			})
		);
	}

	/** Current User */

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

				/** Set 60 minutes cookie */

				this.cookieService.setItem('jwt-user', JSON.stringify(user), {
					expires: new Date(dateNow.setTime(dateNow.getTime() + 60 * 60 * 1000))
				});
			})
		);
	}
}
