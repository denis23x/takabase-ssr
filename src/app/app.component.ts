/** @format */

import { AfterViewInit, Component } from '@angular/core';
import { AppearanceService } from './core/services/appearance.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent implements AfterViewInit {
	constructor(private appearanceService: AppearanceService) {}

	ngAfterViewInit(): void {
		this.appearanceService.setLoader(false);
	}
}
