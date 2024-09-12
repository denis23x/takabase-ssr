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
import { from, Subscription } from 'rxjs';
import { BadgeErrorComponent } from '../../standalone/components/badge-error/badge-error.component';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '../../core/services/snackbar.service';
import { FirebaseService } from '../../core/services/firebase.service';
import { ApiService } from '../../core/services/api.service';
import { signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { catchError, switchMap } from 'rxjs/operators';
import type { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import type { CurrentUser } from '../../core/models/current-user.model';
import type { SignInDto } from '../../core/dto/authorization/sign-in.dto';
import type { FirebaseError } from 'firebase/app';

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
	private readonly metaService: MetaService = inject(MetaService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);
	private readonly apiService: ApiService = inject(ApiService);

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
		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.loginRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setMetaTags(): void {
		const title: string = 'Login - Start Managing Your Account';

		// prettier-ignore
		const description: string = 'Log in to manage your account and access your personalized settings. If you are new here, don’t worry—creating an account is quick, easy and free. Join Takabase today and start enjoying personalized services and content';

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
		// prettier-ignore
		if (this.helperService.getFormValidation(this.loginForm)) {
			this.loginForm.disable();

			const signInDto: SignInDto = {
				...this.loginForm.value
			};

			this.loginRequest$?.unsubscribe();
			this.loginRequest$ = from(signInWithEmailAndPassword(this.firebaseService.getAuth(), signInDto.email, signInDto.password))
				.pipe(
					catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)),
					switchMap((userCredential: UserCredential) => this.authorizationService.setPopulate(userCredential))
				)
				.subscribe({
					next: (currentUser: CurrentUser) => {
						this.router
							.navigate(['/', currentUser.displayName])
							.then(() => this.snackbarService.success('Success', 'Welcome back!'));
					},
					error: () => this.loginForm.enable()
				});
		}
	}
}
