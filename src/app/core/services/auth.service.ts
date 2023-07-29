/** @format */

import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import FingerprintJS, { Agent, GetResult } from '@fingerprintjs/fingerprintjs';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { CookieService } from './cookie.service';
import { SnackbarService } from './snackbar.service';
import { AppearanceService } from './appearance.service';
import { LoginDto } from '../dto/auth/login.dto';
import { LogoutDto } from '../dto/auth/logout.dto';

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
		private appearanceService: AppearanceService
	) {}

	getFingerprint(): Observable<string> {
		return from(this.userAgent.then((agent: Agent) => agent.get())).pipe(
			switchMap((getResult: GetResult) => {
				const { platform, timezone, vendor } = getResult.components;

				return of(FingerprintJS.hashComponents({ platform, timezone, vendor }));
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

	onLogout(): Observable<void> {
		return this.getFingerprint().pipe(
			switchMap((fingerprint: string) => {
				const logoutDto: LogoutDto = {
					fingerprint
				};

				return this.apiService
					.post('/auth/logout', logoutDto)
					.pipe(tap(() => this.removeUser()));
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

	/** Service */

	getUser(): Observable<User | undefined> {
		const user: User | undefined = this.user.getValue();

		if (user) {
			return of(user);
		} else {
			if (this.cookieService.getItem('authed')) {
				return this.onRefresh();
			} else {
				return of(undefined);
			}
		}
	}

	setUser(user: Partial<User>): Observable<void> {
		this.user.next({
			...this.user.getValue(),
			...user
		});

		/** Set token */

		if (user.token) {
			this.cookieService.setItem('authed', String(1));
		}

		/** Set settings */

		// prettier-ignore
		if (user.settings) {
			this.appearanceService.setTheme(user.settings.theme);
			this.appearanceService.setThemeBackground(user.settings.themeBackground);
			this.appearanceService.setThemePrism(user.settings.themePrism);
			this.appearanceService.setPageScrollInfinite(user.settings.pageScrollInfinite);
			this.appearanceService.setPageScrollToTop(user.settings.pageScrollToTop);
			this.appearanceService.setWindowButtonPosition(user.settings.windowButtonPosition);
			this.appearanceService.setMarkdownMonospace(user.settings.markdownMonospace);
		}

		return of(null);
	}

	removeUser(): Observable<void> {
		this.user.next(undefined);

		/** Remove token */

		this.cookieService.removeItem('authed');

		/** Remove settings */

		this.appearanceService.setTheme(null);
		this.appearanceService.setThemeBackground(null);
		this.appearanceService.setThemePrism(null);
		this.appearanceService.setPageScrollInfinite(null);
		this.appearanceService.setPageScrollToTop(null);
		this.appearanceService.setWindowButtonPosition(null);
		this.appearanceService.setMarkdownMonospace(null);

		return of(null);
	}
}
