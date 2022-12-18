/** @format */

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
	ApiService,
	LoginDto,
	LogoutDto,
	LocalStorageService,
	User,
	UserService,
	PlatformService,
	SnackbarService
} from '../index';
import { environment } from '../../../environments/environment';
import FingerprintJS, { Agent, GetResult } from '@fingerprintjs/fingerprintjs';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	// prettier-ignore
	user: BehaviorSubject<User | undefined> = new BehaviorSubject<User | undefined>(undefined);
	userAgent: Promise<Agent> = FingerprintJS.load();

	constructor(
		private apiService: ApiService,
		private userService: UserService,
		private localStorageService: LocalStorageService,
		private platformService: PlatformService,
		private router: Router,
		private snackbarService: SnackbarService
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

				this.router.navigate(['/exception', 403]).then(() => {
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

				this.router.navigate(['/exception', 401]).then(() => {
					this.snackbarService.warning('Unauthorized', 'Login to continue');
				});

				return of(false);
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
						fingerprint,
						scope: ['settings']
					})
					.pipe(tap((user: User) => this.setUser(user)));
			})
		);
	}

	onLogout(logoutDto?: LogoutDto): Observable<User> {
		return this.getFingerprint().pipe(
			switchMap((fingerprint: string) => {
				return this.apiService.post('/auth/logout', {
					...logoutDto,
					fingerprint
				});
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

		if (!!user) {
			return of(user);
		} else {
			if (this.localStorageService.getItem(environment.USER_ACCESS_TOKEN)) {
				return this.apiService
					.get('/auth/me', { scope: ['settings'] })
					.pipe(tap((user: User) => this.setUser(user)));
			} else {
				return of(undefined);
			}
		}
	}

	setUser(user: User): Observable<void> {
		this.user.next(user);

		if (!!user.accessToken) {
			// prettier-ignore
			this.localStorageService.setItem(environment.USER_ACCESS_TOKEN, user.accessToken);
		}

		if (!!user.settings) {
			this.platformService.setSettings(this.user.getValue());
		}

		return of(null);
	}

	removeUser(): Observable<void> {
		this.platformService.removeSettings(this.user.getValue());

		this.localStorageService.removeItem(environment.USER_ACCESS_TOKEN);

		this.user.next(undefined);

		return of(null);
	}
}
