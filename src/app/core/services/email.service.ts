/** @format */

import { inject, Injectable } from '@angular/core';
import { from, Observable, of, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { EmailConfirmationUpdateDto } from '../dto/email/email-confirmation-update.dto';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { catchError } from 'rxjs/operators';
import { EmailUpdateDto } from '../dto/email/email-update.dto';
import { EmailRecoveryDto } from '../dto/email/email-recovery.dto';
import { FirebaseError } from '@angular/fire/app';
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
			catchError((firebaseError: FirebaseError) => this.apiService.setError(firebaseError))
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
			catchError((firebaseError: FirebaseError) => this.apiService.setError(firebaseError))
		);
	}

	onConfirmationGet(): Observable<void> {
		return from(this.angularFireAuth.currentUser).pipe(
			switchMap((firebaseUser: firebase.User) => {
				return from(firebaseUser.sendEmailVerification());
			}),
			catchError((firebaseError: FirebaseError) => this.apiService.setError(firebaseError))
		);
	}

	onConfirmationUpdate(emailConfirmationUpdateDto: EmailConfirmationUpdateDto): Observable<void> {
		return from(this.angularFireAuth.applyActionCode(emailConfirmationUpdateDto.code)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setError(firebaseError))
		);
	}
}
