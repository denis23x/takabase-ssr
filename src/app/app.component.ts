/** @format */

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { Event as RouterEvent, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { TitleService } from './core/services/title.service';
import { UiService } from './core/services/ui.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
	routeEvents$: Subscription | undefined;

	constructor(
		private authService: AuthService,
		private router: Router,
		private titleService: TitleService,
		private uiService: UiService
	) {}

	ngOnInit(): void {
		this.authService.getUser().subscribe({
			next: () => console.debug('Authorization received'),
			error: (error: any) => console.error(error)
		});

		// prettier-ignore
		this.routeEvents$ = this.router.events
			.pipe(filter((routerEvent: RouterEvent) => routerEvent instanceof NavigationEnd))
			.subscribe({
				next: () => this.titleService.setTitle(null),
				error: (error: any) => console.error(error)
			});
	}

	ngAfterViewInit(): void {
		this.uiService.setLoader(false);
	}

	ngOnDestroy(): void {
		[this.routeEvents$].forEach($ => $?.unsubscribe());
	}
}
