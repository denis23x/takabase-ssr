/** @format */

import { Component, inject, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { User } from '../../../core/models/user.model';
import { AuthorizationService } from '../../../core/services/authorization.service';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { Subscription } from 'rxjs';
import { AuthProvider } from '@firebase/auth';

@Component({
	standalone: true,
	selector: 'app-sign-in, [appSignIn]',
	imports: [CommonModule, SvgIconComponent],
	templateUrl: './sign-in.component.html'
})
export class SignInComponent implements OnDestroy {
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly router: Router = inject(Router);
	private readonly userService: UserService = inject(UserService);

	@Input()
	set appSignInDisabled(signInDisabled: boolean) {
		this.signInDisabled = signInDisabled;
	}

	signInDisabled: boolean = false;
	signInWithPopup$: Subscription | undefined;

	ngOnDestroy(): void {
		[this.signInWithPopup$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onSignInWithGoogle(): void {
		const googleAuthProvider: GoogleAuthProvider = new GoogleAuthProvider();

		googleAuthProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

		this.onSignIn(googleAuthProvider);
	}

	onSignInWithFacebook(): void {
		const facebookAuthProvider: FacebookAuthProvider = new FacebookAuthProvider();

		facebookAuthProvider.addScope('public_profile');

		this.onSignIn(facebookAuthProvider);
	}

	onSignInWithGithub(): void {
		const githubAuthProvider: GithubAuthProvider = new GithubAuthProvider();

		githubAuthProvider.addScope('read:user');

		this.onSignIn(githubAuthProvider);
	}

	onSignInWithTwitter(): void {}

	onSignIn(authProvider: AuthProvider): void {
		this.signInWithPopup$?.unsubscribe();
		this.signInWithPopup$ = this.authorizationService.onSignInWithPopup(authProvider).subscribe({
			next: (user: User) => {
				this.router
					.navigate([this.userService.getUserUrl(user)])
					.then(() => console.debug('Route changed'));
			},
			error: (error: any) => console.error(error)
		});
	}
}
