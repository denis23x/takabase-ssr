/** @format */

import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { CookieService } from './cookie.service';
import { LoginDto } from '../dto/auth/login.dto';
import { AppearanceService } from './appearance.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { UserCreateDto } from '../dto/user/user-create.dto';
import { SnackbarService } from './snackbar.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConnectDto } from '../dto/auth/connect.dto';
import firebase from 'firebase/compat';
import UserCredential = firebase.auth.UserCredential;

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	// prettier-ignore
	user: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);

	constructor(
		private apiService: ApiService,
		private cookieService: CookieService,
		private appearanceService: AppearanceService,
		private angularFireAuth: AngularFireAuth,
		private router: Router,
		private userService: UserService,
		private snackbarService: SnackbarService
	) {}

	/** Connect to backend */

	onAttach(userCredential: UserCredential): Observable<any> {
		const connectDto: ConnectDto = {
			uid: userCredential.user.uid,
			email: userCredential.user.email
		};

		return this.apiService.post('/authorization', connectDto);
	}

	onDetach(): Observable<any> {
		return this.apiService.delete('/authorization');
	}

	onVerify(): Observable<User> {
		return this.apiService
			.get('/authorization')
			.pipe(tap((user: User) => this.setUser(user)));
	}

	/** Authorization API */

	onRegistration(userCreateDto: UserCreateDto): Observable<User> {
		// prettier-ignore
		return from(this.angularFireAuth.createUserWithEmailAndPassword(
      userCreateDto.email,
      userCreateDto.password
    )).pipe(
      switchMap((userCredential: UserCredential) => this.onAttach(userCredential)),
      switchMap(() => {
        return this.userService.create(userCreateDto).pipe(
          switchMap(() => {
            const loginDto: LoginDto = {
              email: userCreateDto.email,
              password: userCreateDto.password
            };

            return this.onLogin(loginDto);
          })
        );
      }),
      catchError((httpErrorResponse: HttpErrorResponse) => {
        this.snackbarService.danger('Error', httpErrorResponse.message, {
          icon: 'bug',
          duration: 5000
        });

        return throwError(() => httpErrorResponse);
      })
    );
	}

	onLogin(loginDto: LoginDto): Observable<User> {
		// prettier-ignore
		return from(this.angularFireAuth.signInWithEmailAndPassword(
      loginDto.email,
      loginDto.password
    )).pipe(
      switchMap((userCredential: UserCredential) => this.onAttach(userCredential)),
      switchMap(() => this.onVerify()),
      catchError((httpErrorResponse: HttpErrorResponse) => {
        this.snackbarService.danger('Error', httpErrorResponse.message, {
          icon: 'bug',
          duration: 5000
        });

        return throwError(() => httpErrorResponse);
      })
    );
	}

	onLogout(): Observable<void> {
		return from(this.angularFireAuth.signOut()).pipe(
			switchMap(() => this.onDetach()),
			tap(() => this.removeUser())
		);
	}

	/** Service */

	getUser(): Observable<User | undefined> {
		const userInMemory: User | undefined = this.user.getValue();
		const userInCookie = (): User | undefined => {
			const cookie: string | undefined = this.cookieService.getItem('jwt-user');

			return cookie ? JSON.parse(cookie) : undefined;
		};

		return of(userInMemory || userInCookie() || undefined);
	}

	setUser(user: Partial<User>): Observable<User> {
		const userSaved: User = this.user.getValue();

		/** Set user */

		this.user.next({
			...userSaved,
			...user
		});

		/** Set settings */

		if (user.settings) {
			this.appearanceService.setSettings(user.settings);
		}

		return of(this.user.getValue());
	}

	removeUser(): Observable<void> {
		// const userSaved: User = this.user.getValue();

		/** Set user */

		this.user.next(undefined);

		/** Remove settings */

		this.appearanceService.setSettings(null);

		return of(null);
	}

	// FIREBASE

	SendVerificationMail() {
		return this.angularFireAuth.currentUser
			.then((u: any) => u.sendEmailVerification())
			.then(() => {
				this.router.navigate(['verify-email-address']);
			});
	}

	ForgotPassword(passwordResetEmail: string) {
		return this.angularFireAuth
			.sendPasswordResetEmail(passwordResetEmail)
			.then(() => {
				window.alert('Password reset email sent, check your inbox.');
			})
			.catch(error => {
				window.alert(error);
			});
	}
}
