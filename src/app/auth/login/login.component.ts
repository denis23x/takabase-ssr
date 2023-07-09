/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AuthService } from '../../core/services/auth.service';
import { HelperService } from '../../core/services/helper.service';
import { UserService } from '../../core/services/user.service';
import { LoginDto } from '../../core/dto/auth/login.dto';
import { User } from '../../core/models/user.model';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { MetaService } from '../../core/services/meta.service';
import { AppInputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { OauthComponent } from '../../standalone/components/oauth/oauth.component';

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
		AppInputTrimWhitespaceDirective,
		OauthComponent
	],
	selector: 'app-auth-login',
	templateUrl: './login.component.html'
})
export class AuthLoginComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	loginForm: FormGroup | undefined;
	loginForm$: Subscription | undefined;

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private userService: UserService,
		private metaService: MetaService
	) {
		this.loginForm = this.formBuilder.group<LoginForm>({
			email: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.email
			]),
			password: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.pattern(this.helperService.getRegex('password'))
			])
		});
	}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.queryParams
			.pipe(
				filter((params: Params) => {
					const email: string | undefined = params.email;
					const social: any = ['facebookId', 'githubId', 'googleId']
						.filter((social: string) => params[social])
						.map((social: string) => ({ [social]: params[social] }))
						.shift();

					return !!email && !!social;
				})
			)
			.subscribe({
				next: (params: Params) => {
					this.loginForm.get('email').setValue(params.email);
					this.loginForm.get('email').markAsTouched();

					this.onLogin(params);
				},
				error: (error: any) => console.error(error)
			});

		this.setMeta();
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	setMeta(): void {
		const title: string = 'Login';

		// prettier-ignore
		const description: string = 'To access your account, please enter your login credentials below';

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

		this.authService.onLogin(loginDto).subscribe({
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
