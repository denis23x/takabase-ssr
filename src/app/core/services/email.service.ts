/** @format */

import { Injectable } from '@angular/core';
import { from, Observable, switchMap } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { EmailConfirmationUpdateDto } from '../dto/email/email-confirmation-update.dto';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { EmailUpdateDto } from '../dto/email/email-update.dto';
import firebase from 'firebase/compat';

@Injectable({
	providedIn: 'root'
})
export class EmailService {
	constructor(
		private apiService: ApiService,
		private angularFireAuth: AngularFireAuth
	) {}

	// prettier-ignore
	onUpdate(emailUpdateDto: EmailUpdateDto): Observable<any> {
		return from(this.angularFireAuth.currentUser).pipe(
			switchMap((user: firebase.User) => {
				return user.updateEmail(emailUpdateDto.newEmail);
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				return this.apiService.setError(httpErrorResponse);
			})
		);
	}

	// prettier-ignore
	onConfirmationGet(): Observable<any> {
		return from(this.angularFireAuth.currentUser).pipe(
      switchMap((user: firebase.User) => user.sendEmailVerification()),
      catchError((httpErrorResponse: HttpErrorResponse) => {
        return this.apiService.setError(httpErrorResponse);
      })
    );
	}

	// TODO: update
	// prettier-ignore
	onConfirmationUpdate(emailConfirmationUpdateDto: EmailConfirmationUpdateDto): Observable<Partial<User>> {
    // return from(this.angularFireAuth.currentUser).pipe(
    //   switchMap((user: firebase.User) => this.angularFireAuth.credential.),
    //   catchError((httpErrorResponse: HttpErrorResponse) => {
    //     return this.apiService.setError(httpErrorResponse);
    //   })
    // );

    return this.apiService.put('/email/confirmation', emailConfirmationUpdateDto);
  }
}
