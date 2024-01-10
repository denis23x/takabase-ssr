/** @format */

import { inject, Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { PasswordValidateGetDto } from '../dto/password/password-validate-get.dto';
import { PasswordResetGetDto } from '../dto/password/password-reset-get.dto';
import { PasswordResetUpdateDto } from '../dto/password/password-reset-update.dto';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { EmailAuthProvider } from 'firebase/auth';
import { PasswordUpdateDto } from '../dto/password/password-update.dto';
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
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
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
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}

	onResetGet(passwordResetGetDto: PasswordResetGetDto): Observable<void> {
		return from(this.angularFireAuth.sendPasswordResetEmail(passwordResetGetDto.email)).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
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
        catchError((httpErrorResponse: HttpErrorResponse) => {
          return this.apiService.setError(httpErrorResponse);
        }));
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}
}
