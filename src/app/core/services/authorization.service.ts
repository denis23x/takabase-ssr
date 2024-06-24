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
	onAuthStateChanged,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	linkWithCredential,
	User as FirebaseUser,
	UserCredential,
	GithubAuthProvider,
	Unsubscribe,
	GoogleAuthProvider,
	AuthProvider,
	OAuthCredential,
	Auth
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { UserCreateDto } from '../dto/user/user-create.dto';
import { SignInDto } from '../dto/authorization/sign-in.dto';
import { Router } from '@angular/router';
import { CookiesService } from './cookies.service';

@Injectable({
	providedIn: 'root'
})
export class AuthorizationService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly userService: UserService = inject(UserService);
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);
	private readonly router: Router = inject(Router);
	private readonly cookiesService: CookiesService = inject(CookiesService);

	currentUser: BehaviorSubject<CurrentUser | undefined> = new BehaviorSubject<CurrentUser | undefined>(undefined);
	currentUserIsPopulated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	currentUserPendingOAuthCredential: OAuthCredential | undefined;

	getPopulate(): Observable<CurrentUser | undefined> {
		return this.getCurrentUser().pipe(
			switchMap((currentUser: CurrentUser | undefined) => {
				if (currentUser) {
					return of(currentUser);
				}

				const getAuthState = (): Promise<FirebaseUser | null> => {
					return new Promise(resolve => {
						// prettier-ignore
						const authStateChanged$: Unsubscribe = onAuthStateChanged(this.firebaseService.getAuth(),  (firebaseUser: FirebaseUser | null) => {
							resolve(firebaseUser);

							// Unsubscribe
							authStateChanged$?.();
						});
					});
				};

				return from(getAuthState()).pipe(
					switchMap((firebaseUser: FirebaseUser | null) => {
						if (firebaseUser) {
							return this.onProfile().pipe(
								switchMap((currentUser: CurrentUser) => {
									return this.setCurrentUser({
										firebase: firebaseUser,
										...currentUser
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
		const getObservable = (): Observable<UserCredential> => {
			const pendingCredential: OAuthCredential | undefined = this.currentUserPendingOAuthCredential;

			if (!!pendingCredential) {
				// prettier-ignore
				return from(linkWithCredential(userCredential.user, pendingCredential)).pipe(tap(() => (this.currentUserPendingOAuthCredential = undefined)));
			} else {
				return of(userCredential);
			}
		};

		return getObservable().pipe(
			switchMap(() => this.onProfile()),
			switchMap((user: Partial<CurrentUser>) => {
				return this.appearanceService.getAppearance(userCredential.user.uid).pipe(switchMap(() => of(user)));
			}),
			switchMap((user: Partial<CurrentUser>) => {
				return this.setCurrentUser({
					firebase: userCredential.user,
					...user
				});
			})
		);
	}

	/** Authorization API */

	onRegistration(userCreateDto: UserCreateDto): Observable<CurrentUser> {
		const auth: Auth = this.firebaseService.getAuth();

		const signInDto: SignInDto = {
			email: userCreateDto.email,
			password: userCreateDto.password
		};

		return from(createUserWithEmailAndPassword(auth, signInDto.email, signInDto.password)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)),
			switchMap(() => this.userService.create(userCreateDto)),
			switchMap(() => this.onSignInWithEmailAndPassword(signInDto))
		);
	}

	onProfile(): Observable<CurrentUser> {
		return this.apiService.post('/v1/authorization/profile');
	}

	onLogoutRevoke(): Observable<void> {
		return this.apiService.post('/v1/authorization/logout/revoke').pipe(switchMap(() => this.onSignOut()));
	}

	/** Firebase API */

	onSignInWithEmailAndPassword(signInDto: SignInDto): Observable<CurrentUser> {
		return from(signInWithEmailAndPassword(this.firebaseService.getAuth(), signInDto.email, signInDto.password)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)),
			switchMap((userCredential: UserCredential) => this.setPopulate(userCredential))
		);
	}

	onSignInWithPopup(authProvider: AuthProvider): Observable<CurrentUser> {
		return from(signInWithPopup(this.firebaseService.getAuth(), authProvider)).pipe(
			catchError((firebaseError: FirebaseError) => {
				// Save the pending credential
				if (firebaseError.code === 'auth/account-exists-with-different-credential') {
					this.currentUserPendingOAuthCredential = this.getCredentialFromError(authProvider, firebaseError);
				}

				return this.apiService.setFirebaseError(firebaseError);
			}),
			switchMap((userCredential: UserCredential) => this.setPopulate(userCredential))
		);
	}

	onSignOut(): Observable<void> {
		return from(signOut(this.firebaseService.getAuth())).pipe(
			catchError((firebaseError: FirebaseError) => {
				return from(this.router.navigate(['/error', 500])).pipe(
					switchMap(() => this.apiService.setFirebaseError(firebaseError))
				);
			}),
			tap(() => this.appearanceService.setSettings(null)),
			tap(() => this.currentUser.next(undefined)),
			tap(() => this.cookiesService.removeItem('user-authed'))
		);
	}

	getCredentialFromError = (authProvider: AuthProvider, firebaseError: FirebaseError): OAuthCredential => {
		switch (authProvider.providerId) {
			case 'google.com':
				return GoogleAuthProvider.credentialFromError(firebaseError);
			case 'facebook.com':
				return FacebookAuthProvider.credentialFromError(firebaseError);
			case 'github.com':
				return GithubAuthProvider.credentialFromError(firebaseError);
			default:
				throw new Error('Invalid providerId specified: ' + authProvider.providerId);
		}
	};

	getAuthProvider(providerId: string): AuthProvider {
		switch (providerId) {
			case 'google.com': {
				const googleAuthProvider: GoogleAuthProvider = new GoogleAuthProvider();

				googleAuthProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
				googleAuthProvider.setDefaultLanguage('en');

				return googleAuthProvider;
			}
			case 'facebook.com': {
				const facebookAuthProvider: FacebookAuthProvider = new FacebookAuthProvider();

				facebookAuthProvider.addScope('public_profile');
				facebookAuthProvider.setDefaultLanguage('en');

				return facebookAuthProvider;
			}
			case 'github.com': {
				const githubAuthProvider: GithubAuthProvider = new GithubAuthProvider();

				githubAuthProvider.addScope('read:user');
				githubAuthProvider.setDefaultLanguage('en');

				return githubAuthProvider;
			}
			default: {
				throw new Error('Invalid providerId specified: ' + providerId);
			}
		}
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

		return this.currentUser
			.asObservable()
			.pipe(tap((currentUser: CurrentUser) => this.cookiesService.setItem('user-authed', currentUser.name)));
	}
}
