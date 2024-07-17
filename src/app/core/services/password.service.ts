/** @format */

import { inject, Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { PasswordValidateGetDto } from '../dto/password/password-validate-get.dto';
import { PasswordResetGetDto } from '../dto/password/password-reset-get.dto';
import { PasswordResetUpdateDto } from '../dto/password/password-reset-update.dto';
import { catchError } from 'rxjs/operators';
import {
	Auth,
	AuthCredential,
	UserCredential,
	EmailAuthProvider,
	updatePassword,
	reauthenticateWithCredential,
	sendPasswordResetEmail,
	verifyPasswordResetCode,
	confirmPasswordReset
} from 'firebase/auth';
import { PasswordUpdateDto } from '../dto/password/password-update.dto';
import { FirebaseError } from 'firebase/app';
import { FirebaseService } from './firebase.service';

@Injectable()
export class PasswordService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);

	onUpdate(passwordUpdateDto: PasswordUpdateDto): Observable<void> {
		const auth: Auth = this.firebaseService.getAuth();

		return from(updatePassword(auth.currentUser, passwordUpdateDto.newPassword)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}

	onValidate(passwordValidateGetDto: PasswordValidateGetDto): Observable<UserCredential> {
		const auth: Auth = this.firebaseService.getAuth();

		const credentials: AuthCredential = EmailAuthProvider.credential(
			auth.currentUser.email,
			passwordValidateGetDto.password
		);

		return from(reauthenticateWithCredential(auth.currentUser, credentials)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}

	onResetSendEmail(passwordResetGetDto: PasswordResetGetDto): Observable<void> {
		const auth: Auth = this.firebaseService.getAuth();

		return from(sendPasswordResetEmail(auth, passwordResetGetDto.email)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}

	onReset(passwordResetUpdateDto: PasswordResetUpdateDto): Observable<void> {
		const auth: Auth = this.firebaseService.getAuth();

		return from(verifyPasswordResetCode(auth, passwordResetUpdateDto.code)).pipe(
			switchMap(() => {
				return from(confirmPasswordReset(auth, passwordResetUpdateDto.code, passwordResetUpdateDto.password)).pipe(
					catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
				);
			}),
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}
}
