/** @format */

import { Injectable } from '@angular/core';
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
	constructor(
		private apiService: ApiService,
		private angularFireAuth: AngularFireAuth
	) {}

	onUpdate(passwordUpdateDto: PasswordUpdateDto): Observable<any> {
		return from(this.angularFireAuth.currentUser).pipe(
			switchMap((user: firebase.User) => {
				return from(user.updatePassword(passwordUpdateDto.newPassword));
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}

	// prettier-ignore
	onValidateGet(passwordValidateGetDto: PasswordValidateGetDto): Observable<any> {
		return from(this.angularFireAuth.currentUser).pipe(
			switchMap((user: firebase.User) => {
				const credentials: firebase.auth.AuthCredential = EmailAuthProvider.credential(
					user.email,
					passwordValidateGetDto.password
				);

				return from(user.reauthenticateWithCredential(credentials));
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}

	// prettier-ignore
	onResetGet(passwordResetGetDto: PasswordResetGetDto): Observable<any> {
		return from(this.angularFireAuth.sendPasswordResetEmail(passwordResetGetDto.email)).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}

	// prettier-ignore
	onResetUpdate(passwordResetUpdateDto: PasswordResetUpdateDto): Observable<any> {
		return from(this.angularFireAuth.verifyPasswordResetCode(passwordResetUpdateDto.code)).pipe(
			switchMap(() => {
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
