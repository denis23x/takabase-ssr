/** @format */

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AppearanceService } from './core/services/appearance.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from './core/services/auth.service';
import { filter, first, switchMap } from 'rxjs/operators';
import { User } from './core/models/user.model';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, AfterViewInit {
	constructor(
		private appearanceService: AppearanceService,
		private authService: AuthService,
		private angularFireAuth: AngularFireAuth
	) {}

	ngOnInit(): void {
		this.angularFireAuth.authState
			.pipe(
				first(),
				filter((user: any) => !!user),
				switchMap(() => this.authService.getCurrentUser()),
				switchMap((user: User | undefined) => {
					if (user) {
						return this.authService.setCurrentUser(user);
					} else {
						return this.authService.getCurrentUserFromServer();
					}
				})
			)
			.subscribe({
				next: (user: User) => console.log(user),
				error: (error: any) => console.error(error)
			});
	}

	ngAfterViewInit(): void {
		this.appearanceService.setLoader(false);
	}
}
