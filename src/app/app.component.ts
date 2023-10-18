/** @format */

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AppearanceService } from './core/services/appearance.service';
import { AuthService } from './core/services/auth.service';
import { first } from 'rxjs/operators';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit {
	constructor(
		private appearanceService: AppearanceService,
		private authService: AuthService
	) {}

	ngOnInit(): void {
		this.authService
			.onPopulate()
			.pipe(first())
			.subscribe({
				next: () => console.debug('Populated'),
				error: (error: any) => console.error(error)
			});
	}

	ngAfterViewInit(): void {
		this.appearanceService.setLoader(false);
	}
}
