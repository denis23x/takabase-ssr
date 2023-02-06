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
import {
	AuthService,
	UserCreateDto,
	LoginDto,
	HelperService,
	User,
	UserService
} from '../../core';
import { switchMap } from 'rxjs/operators';
import { SvgIconComponent } from '../../shared';
import { CommonModule } from '@angular/common';

interface RegistrationForm {
	name: FormControl<string>;
	email: FormControl<string>;
	password: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, ReactiveFormsModule, SvgIconComponent],
	selector: 'app-auth-registration',
	templateUrl: './registration.component.html'
})
export class AuthRegistrationComponent implements OnInit {
	registrationForm: FormGroup | undefined;
	registrationFormIsSubmitted: boolean = false;

	constructor(
		private router: Router,
		private authService: AuthService,
		private userService: UserService,
		private formBuilder: FormBuilder,
		private helperService: HelperService
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
			])
		});
	}

	ngOnInit(): void {}

	onSubmitRegistrationForm(): void {
		if (this.helperService.getFormValidation(this.registrationForm)) {
			this.registrationFormIsSubmitted = true;

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
						this.router
							.navigate([this.userService.getUserUrl(user)])
							.then(() => console.debug('Route changed'));
					},
					error: () => (this.registrationFormIsSubmitted = false)
				});
		}
	}
}
