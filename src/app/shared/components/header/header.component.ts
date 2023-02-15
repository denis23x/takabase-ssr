/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { CommonModule } from '@angular/common';
import { AppAuthenticatedDirective } from '../../directives/app-authenticated.directive';
import { UserUrlPipe } from '../../pipes/user-url.pipe';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

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
