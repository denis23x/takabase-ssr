/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { HelperService } from '../../core/services/helper.service';
import { AppInputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { LoginDto } from '../../core/dto/auth/login.dto';
import { UserService } from '../../core/services/user.service';
import { PasswordResetUpdateDto } from '../../core/dto/password/password-reset-update.dto';
import { SnackbarService } from '../../core/services/snackbar.service';
import { OauthComponent } from '../../standalone/components/oauth/oauth.component';
import { PasswordService } from '../../core/services/password.service';

interface PasswordForm {
	token: FormControl<string>;
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
	selector: 'app-auth-reset-password',
	templateUrl: './reset-password.component.html'
})
export class AuthResetPasswordComponent implements OnInit, OnDestroy {
	activatedRouteQueryParams$: Subscription | undefined;

	passwordForm: FormGroup | undefined;
	passwordForm$: Subscription | undefined;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private activatedRoute: ActivatedRoute,
		private authService: AuthService,
		private router: Router,
		private userService: UserService,
		private snackbarService: SnackbarService,
		private passwordService: PasswordService
	) {
		this.passwordForm = this.formBuilder.group<PasswordForm>({
			token: this.formBuilder.nonNullable.control('', [Validators.required]),
			password: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.pattern(this.helperService.getRegex('password'))
			])
		});
	}

	ngOnInit(): void {
		// prettier-ignore
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams.subscribe({
      next: (params: Params) => this.passwordForm.get('token').setValue(params.token),
      error: (error: any) => console.error(error)
    });
	}

	ngOnDestroy(): void {
		[this.activatedRouteQueryParams$].forEach($ => $?.unsubscribe());
	}

	onSubmitPasswordForm(): void {
		if (this.helperService.getFormValidation(this.passwordForm)) {
			this.passwordForm.disable();

			const passwordResetUpdateDto: PasswordResetUpdateDto = {
				...this.passwordForm.value
			};

			this.passwordService.onResetUpdate(passwordResetUpdateDto).subscribe({
				next: (user: Partial<User>) => {
					const loginDto: LoginDto = {
						email: user.email,
						password: passwordResetUpdateDto.password
					};

					this.authService.onLogin(loginDto).subscribe({
						next: (user: User) => {
							// prettier-ignore
							this.router
								.navigate([this.userService.getUserUrl(user)])
								.then(() => this.snackbarService.success('Success', 'Password has been changed'));
						},
						error: () => this.passwordForm.enable()
					});
				},
				error: () => this.passwordForm.enable()
			});
		}
	}
}
