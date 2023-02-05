/** @format */

import {
	AfterViewInit,
	Component,
	Inject,
	OnDestroy,
	OnInit
} from '@angular/core';
import { AuthService, PlatformService, TitleService } from './core';
import { DOCUMENT } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Event as RouterEvent, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
	routeEvents$: Subscription | undefined;

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private authService: AuthService,
		private platformService: PlatformService,
		private router: Router,
		private titleService: TitleService
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
		if (this.platformService.isBrowser()) {
			this.document.body.querySelector('#loader').remove();
		}
	}

	ngOnDestroy(): void {
		[this.routeEvents$].forEach($ => $?.unsubscribe());
	}
}
