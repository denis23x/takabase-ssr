/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../../core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { AppAuthenticatedDirective } from '../../directives';
import { UserUrlPipe } from '../../pipes';
import { AvatarComponent } from '../avatar/avatar.component';
import { CommonModule } from '@angular/common';

@Component({
	standalone: true,
	selector: 'app-header, [appHeader]',
	imports: [
		CommonModule,
		RouterModule,
		SvgIconComponent,
		AvatarComponent,
		AppAuthenticatedDirective,
		UserUrlPipe
	],
	templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
	authUser: User | undefined;
	authUser$: Subscription | undefined;

	constructor(private authService: AuthService, private router: Router) {}

	ngOnInit(): void {
		this.authUser$ = this.authService.user.subscribe({
			next: (user: User) => (this.authUser = user),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.authUser$].forEach($ => $?.unsubscribe());
	}
}
