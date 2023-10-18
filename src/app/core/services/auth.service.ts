/** @format */

import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
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
		private angularFireAuth: AngularFireAuth,
		private userService: UserService
	) {}

	onPopulate(): Observable<User | undefined> {
		return this.getCurrentUser().pipe(
			switchMap((currentUser: User | undefined) => {
				if (currentUser) {
					return of(currentUser);
				}

				return from(this.angularFireAuth.authState).pipe(
					switchMap((firebaseUser: firebase.User | null) => {
						if (firebaseUser) {
							const connectDto: ConnectDto = {
								firebaseId: firebaseUser.uid
							};

							return this.apiService.post('/authorization', connectDto).pipe(
								switchMap((user: User) => {
									return this.setCurrentUser({
										...firebaseUser,
										...user
									});
								})
							);
						}

						return of(undefined);
					})
				);
			})
		);
	}

	/** Authorization API */

	onRegistration(registrationDto: RegistrationDto): Observable<User> {
		// prettier-ignore
		return from(this.angularFireAuth.createUserWithEmailAndPassword(registrationDto.email, registrationDto.password)).pipe(
			switchMap((userCredential: any) => {
				return from(userCredential.user.sendEmailVerification()).pipe(switchMap(() => of(userCredential)));
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
		const currentUser: Partial<User> = {};

		// prettier-ignore
		return from(this.angularFireAuth.signInWithEmailAndPassword(loginDto.email, loginDto.password)).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			}),
			tap((userCredential: firebase.auth.UserCredential) => currentUser.firebase = userCredential.user),
			switchMap((userCredential: firebase.auth.UserCredential) => {
				const connectDto: ConnectDto = {
					firebaseId: userCredential.user.uid
				};

				return this.apiService.post('/authorization', connectDto);
			}),
			switchMap((user: User) => {
        return this.setCurrentUser({
          ...currentUser,
          ...user
        });
			})
		);
	}

	onLogout(): Observable<void> {
		return from(this.angularFireAuth.signOut()).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			}),
			switchMap(() => {
				return this.apiService
					.delete('/authorization')
					.pipe(tap(() => this.user.next(undefined)));
			})
		);
	}

	/** Current User */

	getCurrentUser(): Observable<User | undefined> {
		return this.user.asObservable();
	}

	setCurrentUser(user: User): Observable<User> {
		const currentUser: User = this.user.getValue();

		this.user.next({
			...currentUser,
			...user
		});

		return this.user.asObservable();
	}
}
