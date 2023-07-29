/** @format */

import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import FingerprintJS, { Agent, GetResult } from '@fingerprintjs/fingerprintjs';
import { User } from '../models/user.model';
import { ApiService } from './api.service';
import { CookieService } from './cookie.service';
import { LoginDto } from '../dto/auth/login.dto';
import { LogoutDto } from '../dto/auth/logout.dto';
import { SettingsService } from './settings.service';

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
		private settingsService: SettingsService
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
		const userSaved: User = this.user.getValue();

		/** Set user */

		this.user.next({
			...userSaved,
			...user
		});

		/** Set token */

		if (user.token) {
			this.cookieService.setItem('authed', String(1));
		}

		/** Set settings */

		if (user.settings) {
			this.settingsService.setSettings(user.settings);
		}

		return of(null);
	}

	removeUser(): Observable<void> {
		const userSaved: User = this.user.getValue();

		/** Set user */

		this.user.next(undefined);

		/** Remove token */

		this.cookieService.removeItem('authed');

		/** Remove settings */

		this.settingsService.removeSettings(userSaved.settings);

		return of(null);
	}
}
