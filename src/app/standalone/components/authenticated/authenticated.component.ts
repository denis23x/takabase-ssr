/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthorizationService } from '../../../core/services/authorization.service';
import type { CurrentUser } from '../../../core/models/current-user.model';

@Component({
	standalone: true,
	imports: [CommonModule],
	selector: 'app-authenticated, [appAuthenticated]',
	templateUrl: 'authenticated.component.html'
})
export class AuthenticatedComponent implements OnInit, OnDestroy {
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);

	authenticated$: Subscription | undefined;
	authenticated: boolean = false;

	ngOnInit(): void {
		this.authenticated$?.unsubscribe();
		this.authenticated$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser | undefined) => (this.authenticated = !!currentUser),
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		[this.authenticated$].forEach(($: Subscription) => $?.unsubscribe());
	}
}
