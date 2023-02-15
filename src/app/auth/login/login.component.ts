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
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon.component';
import { AuthService } from '../../core/services/auth.service';
import { HelperService } from '../../core/services/helper.service';
import { UserService } from '../../core/services/user.service';
import { LoginDto } from '../../core/dto/auth/login.dto';
import { User } from '../../core/models/user.model';

interface LoginForm {
	email: FormControl<string>;
	password: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, ReactiveFormsModule, SvgIconComponent],
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
		private userService: UserService
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
			next: (user: User) => {
				this.router
					.navigate([this.userService.getUserUrl(user)])
					.then(() => console.debug('Route changed'));
			},
			error: () => (this.loginFormIsSubmitted = false)
		});
	}

	onSubmitLoginForm(): void {
		if (this.helperService.getFormValidation(this.loginForm)) {
			this.onLogin(this.loginForm.value);
		}
	}
}
