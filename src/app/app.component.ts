/** @format */

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { UiService } from './core/services/ui.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit {
	constructor(private authService: AuthService, private uiService: UiService) {}

	ngOnInit(): void {
		this.authService.getUser().subscribe({
			next: () => console.debug('Authorization received'),
			error: (error: any) => console.error(error)
		});
	}

	ngAfterViewInit(): void {
		this.uiService.setLoader(false);
	}
}
