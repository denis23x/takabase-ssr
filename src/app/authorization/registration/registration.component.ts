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
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AuthorizationService } from '../../core/services/authorization.service';
import { UserService } from '../../core/services/user.service';
import { HelperService } from '../../core/services/helper.service';
import { User } from '../../core/models/user.model';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { MetaService } from '../../core/services/meta.service';
import { AppInputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../core/services/snackbar.service';
import { OauthComponent } from '../../standalone/components/oauth/oauth.component';
import { RegistrationDto } from '../../core/dto/auth/registration.dto';

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
	selector: 'app-authorization-registration',
	templateUrl: './registration.component.html'
})
export class AuthRegistrationComponent implements OnInit {
	registrationForm: FormGroup | undefined;

	constructor(
		private router: Router,
		private authorizationService: AuthorizationService,
		private userService: UserService,
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private metaService: MetaService,
		private snackbarService: SnackbarService
	) {
		this.registrationForm = this.formBuilder.group<RegistrationForm>({
			name: this.formBuilder.nonNullable.control('denis', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(24)
			]),
			email: this.formBuilder.nonNullable.control('denis@mail.ru', [
				Validators.required,
				Validators.email
			]),
			password: this.formBuilder.nonNullable.control('denis@mail.ru', [
				Validators.required,
				Validators.pattern(this.helperService.getRegex('password'))
			]),
			terms: this.formBuilder.nonNullable.control(true, [Validators.requiredTrue])
		});
	}

	ngOnInit(): void {
		/** Apply Data */

		// Nothing to apply

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	setMetaTags(): void {
		const title: string = 'Registration';
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

			const registrationDto: RegistrationDto = {
				...this.registrationForm.value
			};

			this.authorizationService.onRegistration(registrationDto).subscribe({
				next: (user: User) => {
					this.router
						.navigate([this.userService.getUserUrl(user)])
						.then(() => this.snackbarService.info('Success', 'Welcome to our website'));
				},
				error: () => this.registrationForm.enable()
			});
		}
	}
}
