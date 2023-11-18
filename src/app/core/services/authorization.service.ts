/** @format */

import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoginDto } from '../dto/auth/login.dto';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from './user.service';
import { UserCreateDto } from '../dto/user/user-create.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { ConnectDto } from '../dto/auth/connect.dto';
import { RegistrationDto } from '../dto/auth/registration.dto';
import { CurrentUser } from '../models/current-user.model';
import { AppearanceService } from './appearance.service';
import firebase from 'firebase/compat';

@Injectable({
	providedIn: 'root'
})
export class AuthorizationService {
	// prettier-ignore
	currentUser: BehaviorSubject<CurrentUser | undefined> = new BehaviorSubject<CurrentUser | undefined>(undefined);
	currentUserIsPopulated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(
		private apiService: ApiService,
		private angularFireAuth: AngularFireAuth,
		private userService: UserService,
		private appearanceService: AppearanceService
	) {}

	onPopulate(): Observable<CurrentUser | undefined> {
		return this.getCurrentUser().pipe(
			switchMap((currentUser: CurrentUser | undefined) => {
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
								switchMap((user: Partial<CurrentUser>) => {
									return this.setCurrentUser({
										firebase: firebaseUser,
										...user
									});
								})
							);
						}

						return of(undefined);
					})
				);
			}),
			tap(() => this.currentUserIsPopulated.next(true))
		);
	}

	/** Authorization API */

	onRegistration(registrationDto: RegistrationDto): Observable<CurrentUser> {
		// prettier-ignore
		return from(this.angularFireAuth.createUserWithEmailAndPassword(registrationDto.email, registrationDto.password)).pipe(
			switchMap((userCredential: firebase.auth.UserCredential) => {
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

	onLogin(loginDto: LoginDto): Observable<CurrentUser> {
		const currentUser: Partial<CurrentUser> = {};

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
			switchMap((user: Partial<CurrentUser>) => {
				return this.appearanceService.getCollection(currentUser.firebase.uid).pipe(switchMap(() => of(user)));
			}),
			switchMap((user: Partial<CurrentUser>) => {
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
			tap(() => this.appearanceService.setSettings(null)),
			tap(() => this.currentUser.next(undefined))
		);
	}

	/** Current User */

	getCurrentUser(): Observable<CurrentUser | undefined> {
		return this.currentUser.asObservable();
	}

	setCurrentUser(user: Partial<CurrentUser>): Observable<CurrentUser> {
		const currentUser: CurrentUser = this.currentUser.getValue();

		this.currentUser.next({
			...currentUser,
			...user
		});

		return this.currentUser.asObservable();
	}
}
