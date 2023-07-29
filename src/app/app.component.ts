/** @format */

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { AppearanceService } from './core/services/appearance.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit {
	constructor(
		private authService: AuthService,
		private appearanceService: AppearanceService
	) {}

	ngOnInit(): void {
		this.authService.getUser().subscribe({
			next: () => console.debug('Authorization received'),
			error: (error: any) => console.error(error)
		});
	}

	ngAfterViewInit(): void {
		this.appearanceService.setLoader(false);
	}
}
