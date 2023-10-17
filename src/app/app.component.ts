/** @format */

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AppearanceService } from './core/services/appearance.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from './core/services/auth.service';
import { filter, switchMap } from 'rxjs/operators';
import { User } from './core/models/user.model';
import { from } from 'rxjs';
import firebase from 'firebase/compat';

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
		from(this.angularFireAuth.authState)
			.pipe(
				filter((user: firebase.User) => !!user),
				switchMap((user: firebase.User) => this.authService.onRefresh(user))
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
