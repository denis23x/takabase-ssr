/** @format */

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SanitizerPipe } from '../../pipes';
import { AuthService, CookieService, User } from '../../../core';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Component({
	standalone: true,
	selector: 'app-background, [appBackground]',
	imports: [SanitizerPipe],
	templateUrl: './background.component.html'
})
export class BackgroundComponent implements OnInit, OnDestroy {
	authUser: User | undefined;
	authUser$: Subscription | undefined;

	background: string | undefined;

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private httpClient: HttpClient,
		private authService: AuthService,
		private cookieService: CookieService
	) {}

	ngOnInit(): void {
		this.authUser$ = this.authService.user.subscribe({
			next: (user: User) => {
				this.authUser = user;

				// this.setTheme();
				this.setBackground();
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.authUser$].forEach($ => $.unsubscribe());
	}

	setTheme(): void {
		const theme: string = this.authUser?.settings.theme || 'light';

		if (!!theme) {
			this.cookieService.setItem('theme', theme);
			this.document.documentElement.setAttribute('data-theme', theme);
		} else {
			this.cookieService.removeItem('theme');
			this.document.documentElement.removeAttribute('data-theme');
		}
	}

	setBackground(): void {
		// prettier-ignore
		const background: string = this.authUser?.settings.background || 'pattern-randomized';

		const url: string = '/assets/backgrounds/' + background + '.svg';

		this.httpClient
			.get(url, {
				responseType: 'text'
			})
			.subscribe((svg: string) => (this.background = svg));
	}
}
