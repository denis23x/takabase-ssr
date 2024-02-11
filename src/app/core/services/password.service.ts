/** @format */

import { inject, Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { PasswordValidateGetDto } from '../dto/password/password-validate-get.dto';
import { PasswordResetGetDto } from '../dto/password/password-reset-get.dto';
import { PasswordResetUpdateDto } from '../dto/password/password-reset-update.dto';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { catchError } from 'rxjs/operators';
import { EmailAuthProvider } from 'firebase/auth';
import { PasswordUpdateDto } from '../dto/password/password-update.dto';
import { FirebaseError } from '@angular/fire/app';
import firebase from 'firebase/compat';

@Injectable({
	providedIn: 'root'
})
export class PasswordService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly angularFireAuth: AngularFireAuth = inject(AngularFireAuth);

	onUpdate(passwordUpdateDto: PasswordUpdateDto): Observable<void> {
		return from(this.angularFireAuth.currentUser).pipe(
			switchMap((firebaseUser: firebase.User) => {
				return from(firebaseUser.updatePassword(passwordUpdateDto.newPassword));
			}),
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}

	// prettier-ignore
	onValidateGet(passwordValidateGetDto: PasswordValidateGetDto): Observable<firebase.auth.UserCredential> {
		return from(this.angularFireAuth.currentUser).pipe(
			switchMap((firebaseUser: firebase.User) => {
				const credentials: firebase.auth.AuthCredential = EmailAuthProvider.credential(
					firebaseUser.email,
					passwordValidateGetDto.password
				);

				return from(firebaseUser.reauthenticateWithCredential(credentials));
			}),
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}

	onResetGet(passwordResetGetDto: PasswordResetGetDto): Observable<void> {
		return from(this.angularFireAuth.sendPasswordResetEmail(passwordResetGetDto.email)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}

	onResetUpdate(passwordResetUpdateDto: PasswordResetUpdateDto): Observable<void> {
		return from(this.angularFireAuth.verifyPasswordResetCode(passwordResetUpdateDto.code)).pipe(
			switchMap(() => {
				// prettier-ignore
				return from(this.angularFireAuth.confirmPasswordReset(
          passwordResetUpdateDto.code,
          passwordResetUpdateDto.password
        )).pipe(
        catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)));
			}),
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}
}
