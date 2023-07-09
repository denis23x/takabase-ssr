/** @format */

import { Component, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { HelperService } from '../../core/services/helper.service';
import { UserCreateDto } from '../../core/dto/user/user-create.dto';
import { User } from '../../core/models/user.model';
import { LoginDto } from '../../core/dto/auth/login.dto';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { MetaService } from '../../core/services/meta.service';
import { AppInputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../core/services/snackbar.service';
import { OauthComponent } from '../../standalone/components/oauth/oauth.component';
import { Subscription } from 'rxjs';

interface RegistrationForm {
	name: FormControl<string>;
	email: FormControl<string>;
	password: FormControl<string>;
	terms: FormControl<boolean>;
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
	selector: 'app-auth-registration',
	templateUrl: './registration.component.html'
})
export class AuthRegistrationComponent implements OnInit {
	registrationForm: FormGroup | undefined;
	registrationForm$: Subscription | undefined;

	constructor(
		private router: Router,
		private authService: AuthService,
		private userService: UserService,
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private metaService: MetaService,
		private snackbarService: SnackbarService
	) {
		this.registrationForm = this.formBuilder.group<RegistrationForm>({
			name: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(24)
			]),
			email: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.email
			]),
			password: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.pattern(this.helperService.getRegex('password'))
			]),
			terms: this.formBuilder.nonNullable.control(false, [
				Validators.requiredTrue
			])
		});
	}

	ngOnInit(): void {
		this.setMeta();
	}

	setMeta(): void {
		const title: string = 'Registration';

		// prettier-ignore
		const description: string = 'Creating an account with us is quick and easy';

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

	onSubmitRegistrationForm(): void {
		if (this.helperService.getFormValidation(this.registrationForm)) {
			this.registrationForm.disable();

			const userCreateDto: UserCreateDto = {
				...this.registrationForm.value
			};

			this.userService
				.create(userCreateDto)
				.pipe(
					switchMap((user: User) => {
						const loginDto: LoginDto = {
							email: userCreateDto.email,
							password: userCreateDto.password
						};

						return this.authService.onLogin(loginDto);
					})
				)
				.subscribe({
					next: (user: User) => {
						// prettier-ignore
						this.router
							.navigate([this.userService.getUserUrl(user)])
							.then(() => this.snackbarService.success('Success', 'Welcome to our website'));
					},
					error: () => this.registrationForm.enable()
				});
		}
	}
}
