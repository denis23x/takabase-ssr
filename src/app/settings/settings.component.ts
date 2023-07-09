/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Data, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AppScrollIntoViewDirective } from '../standalone/directives/app-scroll-into-view.directive';
import { User } from '../core/models/user.model';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, AppScrollIntoViewDirective],
	selector: 'app-settings',
	templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	user: User | undefined;

	constructor(private activatedRoute: ActivatedRoute) {}

	ngOnInit() {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (user: User) => (this.user = user),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}
}
