/** @format */

import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { AuthService, PlatformService } from './core';
import { DOCUMENT } from '@angular/common';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit {
	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private authService: AuthService,
		private platformService: PlatformService
	) {}

	ngOnInit(): void {
		this.authService.getUser().subscribe({
			next: () => console.debug('Authorization received'),
			error: (error: any) => console.error(error)
		});
	}

	ngAfterViewInit(): void {
		if (this.platformService.isBrowser()) {
			this.document.body.querySelector('#loader').remove();
		}
	}
}
