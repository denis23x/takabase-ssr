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
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon.component';
import { OverlayComponent } from '../../shared/components/overlay/overlay.component';
import { WindowComponent } from '../../shared/components/window/window.component';
import { User } from '../../core/models/user.model';
import { HelperService } from '../../core/services/helper.service';
import { AppInputTrimWhitespaceDirective } from '../../shared/directives/app-input-trim-whitespace.directive';
import { AppInputMarkAsTouchedDirective } from '../../shared/directives/app-input-mark-as-touched.directive';
import { UserUpdateDto } from '../../core/dto/user/user-update.dto';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { SnackbarService } from '../../core/services/snackbar.service';

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
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		SvgIconComponent,
		OverlayComponent,
		WindowComponent,
		AppInputTrimWhitespaceDirective,
		AppInputMarkAsTouchedDirective
	],
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
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private authService: AuthService,
		private snackbarService: SnackbarService
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
		this.confirmationFormIsSubmitted = false;
		this.confirmationFormToggle = toggle;
		this.confirmationForm.reset();

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

			const userUpdateDto: UserUpdateDto = {
				...this.confirmationForm.value
			};

			if (this.emailFormIsSubmitted) {
				userUpdateDto.newEmail = this.emailForm.value.email;
			}

			if (this.passwordFormIsSubmitted) {
				userUpdateDto.newPassword = this.passwordForm.value.password;
			}

			this.userService.update(this.authUser.id, userUpdateDto).subscribe({
				next: (user: User) => {
					this.authService.setUser(user).subscribe({
						next: () => (this.authUser = user),
						error: (error: any) => console.error(error)
					});

					if (this.emailFormIsSubmitted) {
						this.emailForm.reset();
						this.emailForm.markAsUntouched();
					}

					if (this.passwordFormIsSubmitted) {
						this.passwordForm.reset();
						this.passwordForm.markAsUntouched();
					}

					this.onToggleConfirmationForm(false);

					// prettier-ignore
					this.snackbarService.success('Success', 'Account information has been changed');
				},
				error: () => this.onToggleConfirmationForm(false)
			});
		}
	}
}
