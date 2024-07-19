/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AuthorizationService } from '../../core/services/authorization.service';
import { HelperService } from '../../core/services/helper.service';
import { MetaService } from '../../core/services/meta.service';
import { InputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { SignInComponent } from '../../standalone/components/sign-in/sign-in.component';
import { Subscription } from 'rxjs';
import { BadgeErrorComponent } from '../../standalone/components/badge-error/badge-error.component';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../core/services/snackbar.service';
import { PlatformService } from '../../core/services/platform.service';
import { InputShowPassword } from '../../standalone/directives/app-input-show-password.directive';
import { filter } from 'rxjs/operators';
import type { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import type { CurrentUser } from '../../core/models/current-user.model';
import type { User as FirebaseUser } from 'firebase/auth';
import type { SignInDto } from '../../core/dto/authorization/sign-in.dto';

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
		BadgeErrorComponent,
		InputShowPassword
	],
	selector: 'app-authorization-login',
	templateUrl: './login.component.html'
})
export class AuthLoginComponent implements OnInit, OnDestroy {
	private readonly router: Router = inject(Router);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly platformService: PlatformService = inject(PlatformService);

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	loginAuthStateChanged$: Subscription | undefined;
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
			this.loginAuthStateChanged$?.unsubscribe();
			this.loginAuthStateChanged$ = this.authorizationService
				.getAuthState()
				.pipe(filter((firebaseUser: FirebaseUser | null) => !!firebaseUser))
				.subscribe({
					next: () => {
						this.snackbarService.success('Welcome back', 'Redirecting, please wait...');

						/** Disable form for interact */

						this.loginForm.disable();

						/** Get user and redirect */

						this.currentUser$?.unsubscribe();
						this.currentUser$ = this.authorizationService
							.getCurrentUser()
							.pipe(filter((currentUser: CurrentUser | undefined) => !!currentUser))
							.subscribe({
								next: (currentUser: CurrentUser | undefined) => {
									this.router.navigate(['/', currentUser.name]).catch((error: any) => {
										this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error);
									});
								},
								error: (error: any) => console.error(error)
							});
					},
					error: () => this.loginForm.enable()
				});
		}

		/** Apply Data */

		// Nothing to apply

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.currentUser$, this.loginAuthStateChanged$, this.loginRequest$].forEach(($: Subscription) => $?.unsubscribe());
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
			this.loginRequest$ = this.authorizationService.onSignInWithEmailAndPassword(signInDto).subscribe({
				next: () => console.debug('Signed in with email and password'),
				error: () => this.loginForm.enable()
			});
		}
	}
}
