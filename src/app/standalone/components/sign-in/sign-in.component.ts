/** @format */

import { Component, inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { User } from '../../../core/models/user.model';
import { AuthorizationService } from '../../../core/services/authorization.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthProvider } from 'firebase/auth';
import { SvgLogoComponent } from '../svg-logo/svg-logo.component';

@Component({
	standalone: true,
	selector: 'app-sign-in, [appSignIn]',
	imports: [CommonModule, SvgIconComponent, SvgLogoComponent],
	templateUrl: './sign-in.component.html'
})
export class SignInComponent implements OnDestroy {
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly router: Router = inject(Router);

	@Input()
	set appSignInDisabled(signInDisabled: boolean) {
		this.signInDisabled = signInDisabled;
	}

	signInDisabled: boolean = false;
	signInWithPopup$: Subscription | undefined;

	ngOnDestroy(): void {
		[this.signInWithPopup$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onSignInWithProvider(providerId: string): void {
		const authProvider: AuthProvider = this.authorizationService.getAuthProvider(providerId);

		this.signInWithPopup$?.unsubscribe();
		this.signInWithPopup$ = this.authorizationService.onSignInWithPopup(authProvider).subscribe({
			next: (user: User) => this.router.navigate(['/', user.name]).then(() => console.debug('Route changed')),
			error: (error: any) => console.error(error)
		});
	}
}
