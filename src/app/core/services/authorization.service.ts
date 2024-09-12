/** @format */

import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, Observer, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AppearanceService } from './appearance.service';
import { FirebaseService } from './firebase.service';
import {
	FacebookAuthProvider,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	linkWithCredential,
	UserCredential,
	GithubAuthProvider,
	GoogleAuthProvider,
	AuthProvider,
	OAuthCredential
} from 'firebase/auth';
import { Router } from '@angular/router';
import { CookiesService } from './cookies.service';
import { HelperService } from './helper.service';
import type { CurrentUser } from '../models/current-user.model';
import type { FirebaseError } from 'firebase/app';
import type { SignInDto } from '../dto/authorization/sign-in.dto';

@Injectable({
	providedIn: 'root'
})
export class AuthorizationService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);
	private readonly router: Router = inject(Router);
	private readonly cookiesService: CookiesService = inject(CookiesService);
	private readonly helperService: HelperService = inject(HelperService);

	currentUser: BehaviorSubject<CurrentUser | null> = new BehaviorSubject<CurrentUser | null>(null);
	currentUserIsPopulated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	currentUserPendingOAuthCredential: OAuthCredential | undefined;

	getPopulate(): Observable<CurrentUser | null> {
		return this.getCurrentUser().pipe(
			switchMap((currentUser: CurrentUser | null) => {
				if (currentUser) {
					return of(currentUser);
				} else {
					return this.getAuthState().pipe(
						switchMap((currentUser: CurrentUser | null) => {
							if (currentUser) {
								return this.setCurrentUser(currentUser);
							} else {
								return of(null);
							}
						})
					);
				}
			}),
			tap(() => this.currentUserIsPopulated.next(true))
		);
	}

	setPopulate(userCredential: UserCredential): Observable<CurrentUser> {
		return this.getCredentialPending(userCredential).pipe(
			switchMap(() => this.appearanceService.getAppearance(userCredential.user.uid)),
			switchMap(() => this.setCurrentUser(userCredential.user))
		);
	}

	/** Authorization API */

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
				/** Save the pending credential */

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
			tap(() => this.cookiesService.removeItem('__session'))
		);
	}

	getCredentialPending(userCredential: UserCredential): Observable<UserCredential> {
		const pendingCredential: OAuthCredential | undefined = this.currentUserPendingOAuthCredential;

		// prettier-ignore
		if (!!pendingCredential) {
			return from(linkWithCredential(userCredential.user, pendingCredential)).pipe(tap(() => (this.currentUserPendingOAuthCredential = undefined)));
		} else {
			return of(userCredential);
		}
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

	getAuthState(): Observable<CurrentUser | null> {
		return new Observable<CurrentUser | null>((observer: Observer<CurrentUser | null>) => {
			onAuthStateChanged(
				this.firebaseService.getAuth(),
				(currentUser: CurrentUser | null) => observer.next(currentUser),
				(error: any) => observer.error(error),
				() => observer.complete()
			);
		});
	}

	/** Current User */

	getCurrentUser(): Observable<CurrentUser | null> {
		return this.currentUser.asObservable();
	}

	setCurrentUser(currentUserNext: Partial<CurrentUser>): Observable<CurrentUser> {
		const currentUser: CurrentUser = this.currentUser.getValue();

		this.currentUser.next({
			...currentUser,
			...currentUserNext
		});

		this.helperService.upsertSessionCookie({
			userAuthed: (currentUserNext || currentUser)?.displayName
		});

		return this.currentUser.asObservable();
	}
}
