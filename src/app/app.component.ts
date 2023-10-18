/** @format */

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AppearanceService } from './core/services/appearance.service';
import { AuthorizationService } from './core/services/authorization.service';
import { first } from 'rxjs/operators';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit {
	constructor(
		private appearanceService: AppearanceService,
		private authorizationService: AuthorizationService
	) {}

	ngOnInit(): void {
		this.authorizationService
			.onPopulate()
			.pipe(first())
			.subscribe({
				next: (user: any) => {
					console.log(user);
				},
				error: (error: any) => console.error(error)
			});
	}

	ngAfterViewInit(): void {
		this.appearanceService.setLoader(false);
	}
}
