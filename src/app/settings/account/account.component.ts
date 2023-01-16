/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	Validators
} from '@angular/forms';
import { User, HelperService } from '../../core';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Data } from '@angular/router';
import { Subscription } from 'rxjs';

interface EmailForm {
	email: FormControl<string>;
}

interface PasswordForm {
	password: FormControl<string>;
}

interface ConfirmationForm {
	password: FormControl<string>;
}

@Component({
	selector: 'app-settings-account',
	templateUrl: './account.component.html'
})
export class SettingsAccountComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	emailForm: FormGroup | undefined;
	emailFormIsSubmitted: boolean = false;

	passwordForm: FormGroup | undefined;
	passwordFormIsSubmitted: boolean = false;

	confirmationForm: FormGroup | undefined;
	confirmationFormIsSubmitted: boolean = false;
	confirmationFormToggle: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private activatedRoute: ActivatedRoute
	) {
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
		this.confirmationForm = this.formBuilder.group<ConfirmationForm>({
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
				next: (user: User) => (this.authUser = user),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	onSubmitEmailForm(): void {
		if (this.helperService.getFormValidation(this.emailForm)) {
			this.emailFormIsSubmitted = true;

			this.onToggleConfirmationForm(true);
		}
	}

	onSubmitPasswordForm(): void {
		if (this.helperService.getFormValidation(this.passwordForm)) {
			this.passwordFormIsSubmitted = true;

			this.onToggleConfirmationForm(true);
		}
	}

	onToggleConfirmationForm(toggle: boolean): void {
		this.confirmationFormToggle = toggle;

		/** Reset submit when close confirmation */

		if (!this.confirmationFormToggle) {
			if (!!this.emailFormIsSubmitted) {
				this.emailFormIsSubmitted = false;
			}

			if (!!this.passwordFormIsSubmitted) {
				this.passwordFormIsSubmitted = false;
			}
		}
	}

	onSubmitConfirmationForm(): void {
		if (this.helperService.getFormValidation(this.confirmationForm)) {
			this.confirmationFormIsSubmitted = true;
		}
	}
}
