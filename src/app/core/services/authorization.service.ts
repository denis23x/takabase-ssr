/** @format */

import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { CurrentUser } from '../models/current-user.model';
import { AppearanceService } from './appearance.service';
import { FirebaseService } from './firebase.service';
import {
	FacebookAuthProvider,
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	User as FirebaseUser,
	UserCredential
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { UserCreateDto } from '../dto/user/user-create.dto';
import { SignInDto } from '../dto/authorization/sign-in.dto';

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

	getPopulate(): Observable<CurrentUser | undefined> {
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
							return this.onProfile().pipe(
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

	setPopulate(userCredential: UserCredential): Observable<CurrentUser> {
		const currentUser: Partial<CurrentUser> = {
			firebase: userCredential.user
		};

		// prettier-ignore
		return this.onProfile().pipe(
			switchMap((user: Partial<CurrentUser>) => this.appearanceService.getAppearance(currentUser.firebase.uid).pipe(switchMap(() => of(user)))),
			switchMap((user: Partial<CurrentUser>) => {
				return this.setCurrentUser({
					...currentUser,
					...user
				});
			})
		);
	}

	/** Authorization API */

	onRegistration(userCreateDto: UserCreateDto): Observable<CurrentUser> {
		/** Insert default appearance */

		userCreateDto = {
			...userCreateDto,
			appearance: this.appearanceService.getAppearanceDefault()
		};

		const signInDto: SignInDto = {
			email: userCreateDto.email,
			password: userCreateDto.password
		};

		return this.userService
			.create(userCreateDto)
			.pipe(switchMap(() => this.onSignInWithEmailAndPassword(signInDto)));
	}

	onProfile(): Observable<CurrentUser> {
		return this.apiService.post('/v1/authorization/profile');
	}

	onLogoutRevoke(): Observable<void> {
		return this.apiService
			.post('/v1/authorization/logout/revoke')
			.pipe(switchMap(() => this.onSignOut()));
	}

	/** Firebase API */

	onSignInWithEmailAndPassword(signInDto: SignInDto): Observable<CurrentUser> {
		// prettier-ignore
		return from(signInWithEmailAndPassword(this.firebaseService.getAuth(), signInDto.email, signInDto.password)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)),
			switchMap((userCredential: UserCredential) => this.setPopulate(userCredential))
		);
	}

	onSignInWithPopup(provider: GoogleAuthProvider | FacebookAuthProvider): Observable<CurrentUser> {
		return from(signInWithPopup(this.firebaseService.getAuth(), provider)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)),
			switchMap((userCredential: UserCredential) => this.setPopulate(userCredential))
		);
	}

	onSignOut(): Observable<void> {
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
