/** @format */

import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import FingerprintJS, { Agent, GetResult } from '@fingerprintjs/fingerprintjs';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { CookieService } from './cookie.service';
import { SnackbarService } from './snackbar.service';
import { UiService } from './ui.service';
import { LoginDto } from '../dto/auth/login.dto';
import { LogoutDto } from '../dto/auth/logout.dto';
import { PasswordResetUpdateDto } from '../dto/password/password-reset-update.dto';
import { PasswordCheckGetDto } from '../dto/password/password-check-get.dto';
import { PasswordResetGetDto } from '../dto/password/password-reset-get.dto';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	// prettier-ignore
	user: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);
	userAgent: Promise<Agent> = FingerprintJS.load();

	constructor(
		private apiService: ApiService,
		private cookieService: CookieService,
		private router: Router,
		private snackbarService: SnackbarService,
		private uiService: UiService
	) {}

	getFingerprint(): Observable<string> {
		return from(this.userAgent.then((agent: Agent) => agent.get())).pipe(
			switchMap((getResult: GetResult) => {
				const { platform, timezone, vendor } = getResult.components;

				return of(FingerprintJS.hashComponents({ platform, timezone, vendor }));
			})
		);
	}

	/** Guards */

	guardPublic(): Observable<boolean> {
		return this.getUser().pipe(
			switchMap((user: User | undefined) => {
				if (!user) {
					return of(true);
				}

				this.router.navigate(['/error', 403]).then(() => {
					this.snackbarService.warning('Forbidden', 'Access denied');
				});

				return of(false);
			})
		);
	}

	guardPrivate(): Observable<boolean> {
		return this.getUser().pipe(
			switchMap((user: User | undefined) => {
				if (!!user) {
					return of(true);
				}

				this.router.navigate(['/error', 401]).then(() => {
					this.snackbarService.warning('Unauthorized', 'Login to continue');
				});

				return of(false);
			}),
			catchError((httpErrorResponse: HttpErrorResponse) => {
				this.router
					.navigate(['/error', 401])
					.then(() => console.debug('Route changed'));

				return throwError(() => httpErrorResponse);
			})
		);
	}

	/** Authorization API */

	onLogin(loginDto: LoginDto): Observable<User> {
		return this.getFingerprint().pipe(
			switchMap((fingerprint: string) => {
				return this.apiService
					.post('/auth/login', {
						...loginDto,
						fingerprint
					})
					.pipe(tap((user: User) => this.setUser(user)));
			})
		);
	}

	// prettier-ignore
	onLogout(logoutDto?: LogoutDto, removeUser: boolean = true): Observable<void> {
		return this.getFingerprint().pipe(
			switchMap((fingerprint: string) => {
				return this.apiService
					.post('/auth/logout', {
						...logoutDto,
						fingerprint
					})
					.pipe(tap(() => removeUser && this.removeUser()));
			})
		);
	}

	onRefresh(): Observable<User> {
		return this.getFingerprint().pipe(
			switchMap((fingerprint: string) => {
				return this.apiService
					.post('/auth/refresh', { fingerprint })
					.pipe(tap((user: User) => this.setUser(user)));
			})
		);
	}

	// prettier-ignore
	onPasswordCheck(passwordCheckGetDto: PasswordCheckGetDto): Observable<any> {
    return this.apiService.get('/password/check', passwordCheckGetDto);
  }

	// prettier-ignore
	onPasswordReset(passwordResetGetDto: PasswordResetGetDto): Observable<Partial<User>> {
		return this.apiService.get('/password/reset', passwordResetGetDto);
	}

	// prettier-ignore
	onPasswordUpdate(passwordResetUpdateDto: PasswordResetUpdateDto): Observable<Partial<User>> {
		return this.apiService.post('/password/reset', passwordResetUpdateDto);
	}

	/** Service */

	getUser(): Observable<User | undefined> {
		const user: User | undefined = this.user.getValue();

		if (!!user) {
			return of(user);
		} else {
			if (this.cookieService.getItem('authed')) {
				return this.onRefresh();
			} else {
				return of(undefined);
			}
		}
	}

	setUser(user: User): Observable<void> {
		this.user.next({
			...this.user.getValue(),
			...user
		});

		/** Set token */

		if (!!user.token) {
			this.cookieService.setItem('authed', String(1));
		}

		/** Set settings */

		if (!!user.settings) {
			this.uiService.setTheme(user.settings.theme);
			this.uiService.setBackground(user.settings.themeBackground);
			this.uiService.setPrism(user.settings.themePrism);
		}

		return of(null);
	}

	removeUser(): Observable<void> {
		this.user.next(undefined);

		/** Remove token */

		this.cookieService.removeItem('authed');

		/** Remove settings */

		this.uiService.setTheme(null);
		this.uiService.setBackground(null);
		this.uiService.setPrism(null);

		return of(null);
	}
}
