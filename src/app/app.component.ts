/** @format */

import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AppearanceService } from './core/services/appearance.service';
import { AuthorizationService } from './core/services/authorization.service';
import { filter, first } from 'rxjs/operators';
import { CurrentUser } from './core/models/current-user.model';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	constructor(
		private appearanceService: AppearanceService,
		private authorizationService: AuthorizationService
	) {}

	// prettier-ignore
	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService
			.onPopulate()
			.pipe(
				first(),
				filter((currentUser: CurrentUser | undefined) => !!currentUser)
			)
			.subscribe({
				next: (currentUser: CurrentUser) => this.appearanceService.getCollection(currentUser.firebase.uid),
				error: (error: any) => console.error(error)
			});
	}

	ngAfterViewInit(): void {
		this.appearanceService.setLoader(false);
	}

	ngOnDestroy(): void {
		[this.currentUser$].forEach(($: Subscription) => $.unsubscribe());
	}
}
