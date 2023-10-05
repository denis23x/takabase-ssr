/** @format */

import { Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { PasswordCheckGetDto } from '../dto/password/password-check-get.dto';
import { PasswordResetGetDto } from '../dto/password/password-reset-get.dto';
import { PasswordResetUpdateDto } from '../dto/password/password-reset-update.dto';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class PasswordService {
	constructor(
		private apiService: ApiService,
		private angularFireAuth: AngularFireAuth
	) {}

	// TODO: update
	onCheckGet(passwordCheckGetDto: PasswordCheckGetDto): Observable<any> {
		return this.apiService.get('/password/check', passwordCheckGetDto);
	}

	// prettier-ignore
	onResetGet(passwordResetGetDto: PasswordResetGetDto): Observable<void> {
		return from(this.angularFireAuth.sendPasswordResetEmail(passwordResetGetDto.email)).pipe(
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}

	// prettier-ignore
	onResetUpdate(passwordResetUpdateDto: PasswordResetUpdateDto): Observable<void> {
		return from(this.angularFireAuth.verifyPasswordResetCode(passwordResetUpdateDto.token)).pipe(
			switchMap(() => {
				return from(this.angularFireAuth.confirmPasswordReset(
          passwordResetUpdateDto.token,
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
