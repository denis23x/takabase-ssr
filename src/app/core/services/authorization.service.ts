/** @format */

import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoginDto } from '../dto/auth/login.dto';
import { UserService } from './user.service';
import { ConnectDto } from '../dto/auth/connect.dto';
import { CurrentUser } from '../models/current-user.model';
import { AppearanceService } from './appearance.service';
import { FirebaseService } from './firebase.service';
import {
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
	User as FirebaseUser,
	UserCredential
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { UserCreateDto } from '../dto/user/user-create.dto';

@Injectable({
	providedIn: 'root'
})
export class AuthorizationService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly userService: UserService = inject(UserService);
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);

	// prettier-ignore
	currentUser: BehaviorSubject<CurrentUser | undefined> = new BehaviorSubject<CurrentUser | undefined>(undefined);
	currentUserIsPopulated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	onPopulate(): Observable<CurrentUser | undefined> {
		return this.getCurrentUser().pipe(
			switchMap((currentUser: CurrentUser | undefined) => {
				if (currentUser) {
					return of(currentUser);
				}

				// prettier-ignore
				const getAuthState = (): Promise<FirebaseUser | null> => {
					return new Promise((resolve) => {
						onAuthStateChanged(this.firebaseService.getAuth(),  (firebaseUser: FirebaseUser | null) => resolve(firebaseUser));
					});
				}

				return from(getAuthState()).pipe(
					switchMap((firebaseUser: FirebaseUser | null) => {
						if (firebaseUser) {
							const connectDto: ConnectDto = {
								firebaseUid: firebaseUser.uid
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

	onRegistration(userCreateDto: UserCreateDto): Observable<CurrentUser> {
		/** Insert default appearance */

		userCreateDto = {
			...userCreateDto,
			appearance: this.appearanceService.getAppearanceDefault()
		};

		const loginDto: LoginDto = {
			email: userCreateDto.email,
			password: userCreateDto.password
		};

		return this.userService.create(userCreateDto).pipe(switchMap(() => this.onLogin(loginDto)));
	}

	onLogin(loginDto: LoginDto): Observable<CurrentUser> {
		const currentUser: Partial<CurrentUser> = {};

		// prettier-ignore
		return from(signInWithEmailAndPassword(this.firebaseService.getAuth(), loginDto.email, loginDto.password)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)),
			tap((userCredential: UserCredential) => currentUser.firebase = userCredential.user),
			switchMap((userCredential: UserCredential) => {
				const connectDto: ConnectDto = {
					firebaseUid: userCredential.user.uid
				};

				return this.apiService.post('/authorization', connectDto);
			}),
			switchMap((user: Partial<CurrentUser>) => this.appearanceService.getAppearance(currentUser.firebase.uid).pipe(switchMap(() => of(user)))),
			switchMap((user: Partial<CurrentUser>) => {
		    return this.setCurrentUser({
		      ...currentUser,
		      ...user
		    });
			})
		);
	}

	onLogout(): Observable<void> {
		return from(signOut(this.firebaseService.getAuth())).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)),
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
