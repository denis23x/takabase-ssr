/** @format */

import {
	AfterViewInit,
	Component,
	Inject,
	OnDestroy,
	OnInit
} from '@angular/core';
import {
	AuthService,
	MetaService,
	PlatformService,
	TitleService
} from './core';
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
		private titleService: TitleService,
		private metaService: MetaService
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

		this.metaService.setOpenGraph({
			['og:title']: 'denis',
			['og:description']: 'denis',
			['og:type']: 'denis',
			['og:url']: 'denis',
			['og:locale']: 'denis',
			['og:image']: 'denis',
			['og:image:alt']: 'denis',
			['og:image:type']: 'denis',
			['og:site_name']: 'denis'
		});

		this.metaService.setTwitter({
			['twitter:card']: 'denis',
			['twitter:site']: 'denis',
			['twitter:title']: 'denis',
			['twitter:description']: 'denis',
			['twitter:image']: 'denis',
			['twitter:image:alt']: 'denis'
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
