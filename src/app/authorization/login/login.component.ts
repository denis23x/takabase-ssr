/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AuthorizationService } from '../../core/services/authorization.service';
import { HelperService } from '../../core/services/helper.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { MetaService } from '../../core/services/meta.service';
import { InputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { SignInComponent } from '../../standalone/components/sign-in/sign-in.component';
import { Subscription } from 'rxjs';
import { BadgeErrorComponent } from '../../standalone/components/badge-error/badge-error.component';
import { CommonModule } from '@angular/common';
import { SignInDto } from '../../core/dto/authorization/sign-in.dto';
import { onAuthStateChanged, User as FirebaseUser, Unsubscribe } from 'firebase/auth';
import { FirebaseService } from '../../core/services/firebase.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { PlatformService } from '../../core/services/platform.service';

interface LoginForm {
	email: FormControl<string>;
	password: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		SvgIconComponent,
		InputTrimWhitespaceDirective,
		SignInComponent,
		BadgeErrorComponent
	],
	selector: 'app-authorization-login',
	templateUrl: './login.component.html'
})
export class AuthLoginComponent implements OnInit, OnDestroy {
	private readonly router: Router = inject(Router);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly userService: UserService = inject(UserService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly platformService: PlatformService = inject(PlatformService);

	loginAuthStateChanged$: Unsubscribe | undefined;
	loginRequest$: Subscription | undefined;
	loginForm: FormGroup = this.formBuilder.group<LoginForm>({
		email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
		password: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(6),
			Validators.maxLength(48),
			Validators.pattern(this.helperService.getRegex('password'))
		])
	});

	ngOnInit(): void {
		if (this.platformService.isBrowser()) {
			// prettier-ignore
			this.loginAuthStateChanged$ = onAuthStateChanged(this.firebaseService.getAuth(), (firebaseUser: FirebaseUser | null) => {
				if (firebaseUser) {
					this.snackbarService.success('Success', 'Redirecting, please wait...');

					this.loginForm.disable();
				}
			});
		}

		/** Apply Data */

		// Nothing to apply

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.loginRequest$].forEach(($: Subscription) => $?.unsubscribe());

		[this.loginAuthStateChanged$].forEach(($: Unsubscribe) => $?.());
	}

	setMetaTags(): void {
		const title: string = 'Login';
		const description: string = 'Not an user yet? Sign up for free';

		const metaOpenGraph: MetaOpenGraph = {
			['og:title']: title,
			['og:description']: description,
			['og:type']: 'website'
		};

		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description
		};

		this.metaService.setMeta(metaOpenGraph, metaTwitter);
	}

	onSubmitLoginForm(): void {
		if (this.helperService.getFormValidation(this.loginForm)) {
			this.loginForm.disable();

			const signInDto: SignInDto = {
				...this.loginForm.value
			};

			this.loginRequest$?.unsubscribe();
			this.loginRequest$ = this.authorizationService
				.onSignInWithEmailAndPassword(signInDto)
				.subscribe({
					next: (user: User) => {
						this.router
							.navigate([this.userService.getUserUrl(user)])
							.then(() => console.debug('Route changed'));
					},
					error: () => this.loginForm.enable()
				});
		}
	}
}
