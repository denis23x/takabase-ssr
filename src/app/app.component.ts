/** @format */

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AppearanceService } from './core/services/appearance.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from './core/services/auth.service';
import { filter, switchMap } from 'rxjs/operators';
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
				filter((user: any) => !!user),
				switchMap(() => this.authService.getUser())
			)
			.subscribe({
				next: (user: User | undefined) => {
					if (user) {
						this.authService.setUser(user);
					} else {
						this.authService.onVerify();
					}
				},
				error: (error: any) => console.error(error)
			});
	}

	ngAfterViewInit(): void {
		this.appearanceService.setLoader(false);
	}
}
