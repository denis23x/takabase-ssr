/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Data, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { HelperService } from '../../core/services/helper.service';
import { AppInputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../core/services/snackbar.service';
import { PasswordValidateGetDto } from '../../core/dto/password/password-validate-get.dto';
import { CookieService } from '../../core/services/cookie.service';
import { PasswordService } from '../../core/services/password.service';
import { EmailService } from '../../core/services/email.service';
import { PasswordUpdateDto } from '../../core/dto/password/password-update.dto';
import { EmailUpdateDto } from '../../core/dto/email/email-update.dto';
import { CurrentUser } from '../../core/models/current-user.model';

interface PasswordValidateForm {
	password: FormControl<string>;
}

interface EmailForm {
	email: FormControl<string>;
}

interface PasswordForm {
	password: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		SvgIconComponent,
		AppInputTrimWhitespaceDirective
	],
	selector: 'app-settings-account',
	templateUrl: './account.component.html'
})
export class SettingsAccountComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	passwordValidateIsValid: boolean = false;
	passwordValidateForm: FormGroup | undefined;

	emailForm: FormGroup | undefined;
	emailFormConfirmationIsSubmitted: boolean = false;

	passwordForm: FormGroup | undefined;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private activatedRoute: ActivatedRoute,
		private snackbarService: SnackbarService,
		private cookieService: CookieService,
		private emailService: EmailService,
		private passwordService: PasswordService
	) {
		this.passwordValidateForm = this.formBuilder.group<PasswordValidateForm>({
			password: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.pattern(this.helperService.getRegex('password'))
			])
		});
		this.emailForm = this.formBuilder.group<EmailForm>({
			email: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.email
			])
		});
		this.passwordForm = this.formBuilder.group<PasswordForm>({
			password: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.pattern(this.helperService.getRegex('password'))
			])
		});
	}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.parent.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (currentUser: CurrentUser) => {
					this.currentUser = currentUser;

					if (!this.currentUser.firebase.emailVerified) {
						// prettier-ignore
						this.emailForm.get('email').setValue(this.currentUser.firebase.email);
						this.emailForm.disable();
					}
				},
				error: (error: any) => console.error(error)
			});

		// prettier-ignore
		this.passwordValidateIsValid = !!Number(this.cookieService.getItem('password-valid'))
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onSubmitPasswordValidateForm(): void {
		if (this.helperService.getFormValidation(this.passwordValidateForm)) {
			this.passwordValidateForm.disable();

			const passwordValidateGetDto: PasswordValidateGetDto = {
				...this.passwordValidateForm.value
			};

			this.passwordService.onValidateGet(passwordValidateGetDto).subscribe({
				next: () => {
					this.passwordValidateForm.enable();
					this.passwordValidateForm.reset();

					this.passwordValidateIsValid = true;

					const dateNow: Date = new Date();

					/** Set 5 minutes cookie */

					// prettier-ignore
					this.cookieService.setItem('password-valid', '1', {
            expires: new Date(dateNow.setTime(dateNow.getTime() + 5 * 60 * 1000))
          });
				},
				error: () => this.passwordValidateForm.enable()
			});
		}
	}

	onSubmitEmailForm(): void {
		if (this.helperService.getFormValidation(this.emailForm)) {
			this.emailForm.disable();

			const emailUpdateDto: EmailUpdateDto = {
				newEmail: this.emailForm.value.email
			};

			this.emailService.onUpdate(emailUpdateDto).subscribe({
				next: () => {
					this.emailForm.enable();
					this.emailForm.reset();

					// prettier-ignore
					this.snackbarService.success('All right', 'We sent you a verification email');
				},
				error: () => this.emailForm.enable()
			});
		}
	}

	onSubmitEmailConfirmation(): void {
		if (this.helperService.getFormValidation(this.emailForm)) {
			this.emailFormConfirmationIsSubmitted = true;

			this.emailService.onConfirmationGet().subscribe({
				next: () => {
					this.emailFormConfirmationIsSubmitted = false;

					// prettier-ignore
					this.snackbarService.info('All right', 'We sent you a verification email');
				},
				error: () => (this.emailFormConfirmationIsSubmitted = false)
			});
		}
	}

	onSubmitPasswordForm(): void {
		if (this.helperService.getFormValidation(this.passwordForm)) {
			this.passwordForm.disable();

			const passwordUpdateDto: PasswordUpdateDto = {
				newPassword: this.passwordForm.value.password
			};

			this.passwordService.onUpdate(passwordUpdateDto).subscribe({
				next: () => {
					this.passwordForm.enable();
					this.passwordForm.reset();

					// prettier-ignore
					this.snackbarService.success('Success', 'Password has been changed');
				},
				error: () => this.passwordForm.enable()
			});
		}
	}
}
