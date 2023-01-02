/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AuthService, LoginDto, HelperService, User } from '../../core';
import { filter } from 'rxjs/operators';
import { Meta } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

interface LoginForm {
	email: FormControl<string>;
	password: FormControl<string>;
}

@Component({
	selector: 'app-auth-login',
	templateUrl: './login.component.html'
})
export class AuthLoginComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	loginForm: FormGroup | undefined;
	loginFormIsSubmitted: boolean = false;

	constructor(
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private authService: AuthService,
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private meta: Meta
	) {
		this.loginForm = this.formBuilder.group<LoginForm>({
			email: this.formBuilder.control('', [
				Validators.required,
				Validators.email
			]),
			password: this.formBuilder.control('', [
				Validators.required,
				Validators.pattern(this.helperService.getRegex('password'))
			])
		});
	}

	ngOnInit(): void {
		this.meta.addTag({ name: 'title', content: 'my login title' });
		this.meta.addTag({ name: 'description', content: 'my login description' });

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
				next: (params: Params) => this.onLogin(params),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	onLogin(value: any): void {
		this.loginFormIsSubmitted = true;

		const loginDto: LoginDto = {
			...value
		};

		this.authService.onLogin(loginDto).subscribe({
			// prettier-ignore
			next: (user: User) => this.router.navigate(['/@' + user.name]).then(() => console.debug('Route changed')),
			error: () => (this.loginFormIsSubmitted = false)
		});
	}

	onSubmitLoginForm(): void {
		if (this.helperService.getFormValidation(this.loginForm)) {
			this.onLogin(this.loginForm.value);
		}
	}
}
