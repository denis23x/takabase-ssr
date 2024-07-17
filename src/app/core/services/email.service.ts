/** @format */

import { inject, Injectable } from '@angular/core';
import { from, Observable, of, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { EmailConfirmationUpdateDto } from '../dto/email/email-confirmation-update.dto';
import { catchError } from 'rxjs/operators';
import { EmailUpdateDto } from '../dto/email/email-update.dto';
import { EmailRecoveryDto } from '../dto/email/email-recovery.dto';
import {
	Auth,
	ActionCodeInfo,
	verifyBeforeUpdateEmail,
	checkActionCode,
	applyActionCode,
	sendPasswordResetEmail,
	sendEmailVerification
} from 'firebase/auth';
import { FirebaseService } from './firebase.service';
import { FirebaseError } from 'firebase/app';

@Injectable()
export class EmailService {
	private readonly apiService: ApiService = inject(ApiService);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);

	onUpdate(emailUpdateDto: EmailUpdateDto): Observable<void> {
		const auth: Auth = this.firebaseService.getAuth();

		return from(verifyBeforeUpdateEmail(auth.currentUser, emailUpdateDto.newEmail)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}

	onRecovery(emailRecoveryDto: EmailRecoveryDto): Observable<void> {
		const auth: Auth = this.firebaseService.getAuth();

		return from(checkActionCode(auth, emailRecoveryDto.code)).pipe(
			switchMap((actionCodeInfo: ActionCodeInfo) => {
				return from(applyActionCode(auth, emailRecoveryDto.code)).pipe(switchMap(() => of(actionCodeInfo)));
			}),
			switchMap((actionCodeInfo: ActionCodeInfo) => {
				return from(sendPasswordResetEmail(auth, actionCodeInfo.data.email));
			}),
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}

	onConfirmationGet(): Observable<void> {
		const auth: Auth = this.firebaseService.getAuth();

		return from(sendEmailVerification(auth.currentUser)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}

	onConfirmationUpdate(emailConfirmationUpdateDto: EmailConfirmationUpdateDto): Observable<void> {
		const auth: Auth = this.firebaseService.getAuth();

		return from(applyActionCode(auth, emailConfirmationUpdateDto.code)).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError))
		);
	}
}
