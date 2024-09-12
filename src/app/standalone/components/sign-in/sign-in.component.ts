/** @format */

import { Component, EventEmitter, inject, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { AuthorizationService } from '../../../core/services/authorization.service';
import { from, of, Subscription, switchMap } from 'rxjs';
import { SvgLogoComponent } from '../svg-logo/svg-logo.component';
import { AuthProvider, signInWithPopup, getAdditionalUserInfo, updateProfile, UserCredential } from 'firebase/auth';
import { UserService } from '../../../core/services/user.service';
import { catchError, map } from 'rxjs/operators';
import { FirebaseService } from '../../../core/services/firebase.service';
import { ApiService } from '../../../core/services/api.service';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../core/services/snackbar.service';
import type { CurrentUser } from '../../../core/models/current-user.model';
import type { FirebaseError } from 'firebase/app';
import type { AdditionalUserInfo } from 'firebase/auth';
import type { User } from '../../../core/models/user.model';

@Component({
	standalone: true,
	selector: 'app-sign-in, [appSignIn]',
	imports: [CommonModule, SvgIconComponent, SvgLogoComponent],
	providers: [UserService],
	templateUrl: './sign-in.component.html'
})
export class SignInComponent implements OnDestroy {
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);
	private readonly apiService: ApiService = inject(ApiService);
	private readonly userService: UserService = inject(UserService);
	private readonly router: Router = inject(Router);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);

	@Output() appSignInBusy: EventEmitter<boolean> = new EventEmitter<boolean>();

	signInIsBusy: boolean = false;
	signInWithPopup$: Subscription | undefined;

	ngOnDestroy(): void {
		[this.signInWithPopup$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onSignInIsBusyToggle(toggle: boolean): void {
		this.signInIsBusy = toggle;

		// Emit to parent

		this.appSignInBusy.emit(this.signInIsBusy);
	}

	onSignInWithProvider(providerId: string): void {
		this.onSignInIsBusyToggle(true);

		// Auth provider

		const authProvider: AuthProvider = this.authorizationService.getAuthProvider(providerId);

		// Request

		this.signInWithPopup$?.unsubscribe();
		this.signInWithPopup$ = from(signInWithPopup(this.firebaseService.getAuth(), authProvider))
			.pipe(
				catchError((firebaseError: FirebaseError) => {
					/** Save the pending credential */

					// prettier-ignore
					if (firebaseError.code === 'auth/account-exists-with-different-credential') {
						this.authorizationService.currentUserPendingOAuthCredential = this.authorizationService.getCredentialFromError(authProvider, firebaseError);
					}

					return this.apiService.setFirebaseError(firebaseError);
				}),
				switchMap((userCredential: UserCredential) => {
					const additionalUserInfo: AdditionalUserInfo = getAdditionalUserInfo(userCredential);

					if (additionalUserInfo.isNewUser) {
						this.snackbarService.success('Just a moment', 'Redirecting, please wait...');

						return this.userService
							.create()
							.pipe(switchMap(() => from(userCredential.user.reload()).pipe(map(() => userCredential))));
					} else {
						// Prevent unnecessary user update

						const isGoogle: boolean = userCredential.providerId === 'google.com';
						const isGoogleAsSingleProvider: boolean = userCredential.user.providerData.length === 1;

						/** https://firebase.google.com/docs/auth/android/email-link-auth#security_concerns */

						if (isGoogle && isGoogleAsSingleProvider) {
							return this.userService.getOne(userCredential.user.uid).pipe(
								switchMap((user: User) => {
									const isSameName: boolean = user.name === userCredential.user.displayName;
									const isSameAvatar: boolean = user.avatar === userCredential.user.photoURL;

									if (!isSameName || !isSameAvatar) {
										const updateProfileDto: any = {
											displayName: user.name,
											photoURL: user.avatar || ''
										};

										return from(updateProfile(userCredential.user, updateProfileDto)).pipe(
											switchMap(() => from(userCredential.user.reload())),
											map(() => userCredential)
										);
									} else {
										return of(userCredential);
									}
								})
							);
						} else {
							return of(userCredential);
						}
					}
				}),
				switchMap((userCredential: UserCredential) => this.authorizationService.setPopulate(userCredential))
			)
			.subscribe({
				next: (currentUser: CurrentUser) => {
					this.router
						.navigate(['/', currentUser.displayName])
						.then(() => this.snackbarService.success('Success', 'Sign-in via social is successful'));
				},
				error: () => this.onSignInIsBusyToggle(false)
			});
	}
}
