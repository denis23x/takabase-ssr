/** @format */

import { inject, Injectable } from '@angular/core';
import { from, Observable, of, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { EmailConfirmationUpdateDto } from '../dto/email/email-confirmation-update.dto';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { EmailUpdateDto } from '../dto/email/email-update.dto';
import { EmailRecoveryDto } from '../dto/email/email-recovery.dto';
import firebase from 'firebase/compat';

@Injectable({
	providedIn: 'root'
})
export class EmailService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly angularFireAuth: AngularFireAuth = inject(AngularFireAuth);

	onUpdate(emailUpdateDto: EmailUpdateDto): Observable<void> {
		return from(this.angularFireAuth.currentUser).pipe(
			switchMap((firebaseUser: firebase.User) => {
				return from(firebaseUser.verifyBeforeUpdateEmail(emailUpdateDto.newEmail));
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}

	onRecovery(emailRecoveryDto: EmailRecoveryDto): Observable<void> {
		return from(this.angularFireAuth.checkActionCode(emailRecoveryDto.code)).pipe(
			switchMap((actionCodeInfo: firebase.auth.ActionCodeInfo) => {
				return from(this.angularFireAuth.applyActionCode(emailRecoveryDto.code)).pipe(
					switchMap(() => {
						return of(actionCodeInfo);
					})
				);
			}),
			switchMap((actionCodeInfo: firebase.auth.ActionCodeInfo) => {
				return from(this.angularFireAuth.sendPasswordResetEmail(actionCodeInfo.data.email));
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}

	onConfirmationGet(): Observable<void> {
		return from(this.angularFireAuth.currentUser).pipe(
			switchMap((firebaseUser: firebase.User) => {
				return from(firebaseUser.sendEmailVerification());
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}

	onConfirmationUpdate(emailConfirmationUpdateDto: EmailConfirmationUpdateDto): Observable<void> {
		return from(this.angularFireAuth.applyActionCode(emailConfirmationUpdateDto.code)).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}
}
