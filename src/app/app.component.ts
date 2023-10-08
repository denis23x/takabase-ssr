/** @format */

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AppearanceService } from './core/services/appearance.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from './core/services/auth.service';
import { filter, first, switchMap } from 'rxjs/operators';
import { User } from './core/models/user.model';
import { from } from 'rxjs';
import { ConnectDto } from './core/dto/auth/connect.dto';
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
		this.angularFireAuth.authState
			.pipe(
				first(),
				filter((user: firebase.User) => !!user),
				switchMap((user: firebase.User) => {
					return from(user.reload()).pipe(
						switchMap(() => {
							const connectDto: ConnectDto = {
								firebaseId: user.uid
							};

							return this.authService.onAttach(connectDto);
						})
					);
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
