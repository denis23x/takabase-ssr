/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AuthorizationService } from '../../core/services/authorization.service';
import { HelperService } from '../../core/services/helper.service';
import { UserService } from '../../core/services/user.service';
import { LoginDto } from '../../core/dto/auth/login.dto';
import { User } from '../../core/models/user.model';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { MetaService } from '../../core/services/meta.service';
import { InputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { OauthComponent } from '../../standalone/components/oauth/oauth.component';
import { Subscription } from 'rxjs';
import { BadgeErrorComponent } from '../../standalone/components/badge-error/badge-error.component';

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
		OauthComponent,
		BadgeErrorComponent
	],
	selector: 'app-authorization-login',
	templateUrl: './login.component.html'
})
export class AuthLoginComponent implements OnInit, OnDestroy {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly router: Router = inject(Router);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly userService: UserService = inject(UserService);
	private readonly metaService: MetaService = inject(MetaService);

	loginRequest$: Subscription | undefined;
	loginForm: FormGroup = this.formBuilder.group<LoginForm>({
		email: this.formBuilder.nonNullable.control('denis@mail.ru', [
			Validators.required,
			Validators.email
		]),
		password: this.formBuilder.nonNullable.control('denis@mail.ru', [
			Validators.required,
			Validators.pattern(this.helperService.getRegex('password'))
		])
	});

	ngOnInit(): void {
		/** Apply Data */

		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.loginRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setResolver(): void {
		const email: string = String(this.activatedRoute.snapshot.queryParamMap.get('email') || '');

		// prettier-ignore
		const social: any = ['facebookId', 'githubId', 'googleId']
      .filter((social: string) => !!this.activatedRoute.snapshot.queryParamMap.get(social))
      .map((social: string) => ({ [social]: this.activatedRoute.snapshot.queryParamMap.get(social) }))
      .shift();

		if (!!email && !!social) {
			this.loginForm.get('email').setValue(email);
			this.loginForm.get('email').markAsTouched();

			this.onLogin(this.activatedRoute.snapshot.queryParams);
		}
	}

	setMetaTags(): void {
		const title: string = 'Login';
		const description: string = 'Not an Draft user yet? Sign up for free';

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

	onLogin(value: any): void {
		this.loginForm.disable();

		const loginDto: LoginDto = {
			...value
		};

		this.loginRequest$?.unsubscribe();
		this.loginRequest$ = this.authorizationService.onLogin(loginDto).subscribe({
			next: (user: User) => {
				this.router
					.navigate([this.userService.getUserUrl(user)])
					.then(() => console.debug('Route changed'));
			},
			error: () => this.loginForm.enable()
		});
	}

	onSubmitLoginForm(): void {
		if (this.helperService.getFormValidation(this.loginForm)) {
			this.onLogin(this.loginForm.value);
		}
	}
}
