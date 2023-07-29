/** @format */

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { AppearanceService } from './core/services/appearance.service';
import { CookieService } from './core/services/cookie.service';
import { Router } from '@angular/router';
import { debounceTime, pairwise } from 'rxjs/operators';
import { routesRedirect } from './app-routing.module';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
	authUser$: Subscription | undefined;

	constructor(
		private authService: AuthService,
		private appearanceService: AppearanceService,
		private cookieService: CookieService,
		private router: Router
	) {}

	ngOnInit(): void {
		this.authService.getUser().subscribe({
			next: () => console.debug('Authorization received'),
			error: (error: any) => console.error(error)
		});

		this.authUser$ = this.authService.user
			.pipe(debounceTime(100), pairwise())
			.subscribe({
				next: ([a, b]) => {
					console.log(a);
					console.log(b);
					this.router.resetConfig(routesRedirect(this.router.config));
				},
				error: (error: any) => console.error(error)
			});
	}

	ngAfterViewInit(): void {
		this.appearanceService.setLoader(false);
	}

	ngOnDestroy(): void {
		[this.authUser$].forEach($ => $.unsubscribe());
	}
}
