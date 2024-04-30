/** @format */

import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { HelperService } from '../../core/services/helper.service';
import { InputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../core/services/snackbar.service';
import { PasswordValidateGetDto } from '../../core/dto/password/password-validate-get.dto';
import { PasswordService } from '../../core/services/password.service';
import { EmailService } from '../../core/services/email.service';
import { PasswordUpdateDto } from '../../core/dto/password/password-update.dto';
import { EmailUpdateDto } from '../../core/dto/email/email-update.dto';
import { CurrentUser } from '../../core/models/current-user.model';
import { AuthorizationService } from '../../core/services/authorization.service';
import { BadgeErrorComponent } from '../../standalone/components/badge-error/badge-error.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { PlatformService } from '../../core/services/platform.service';
import { catchError, filter } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { UserDeleteComponent } from '../../standalone/components/user/delete/delete.component';

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
		RouterModule,
		ReactiveFormsModule,
		SvgIconComponent,
		InputTrimWhitespaceDirective,
		BadgeErrorComponent,
		SkeletonDirective,
		UserDeleteComponent
	],
	selector: 'app-settings-account',
	templateUrl: './account.component.html'
})
export class SettingsAccountComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly emailService: EmailService = inject(EmailService);
	private readonly passwordService: PasswordService = inject(PasswordService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly router: Router = inject(Router);

	// prettier-ignore
	@ViewChild('appUserDeleteComponent') appUserDeleteComponent: UserDeleteComponent | undefined;

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;
	currentUserSkeletonToggle: boolean = true;
	currentUserLogoutRequest$: Subscription | undefined;

	currentUserLogoutRevokeRequestIsSubmitted: boolean = false;
	currentUserLogoutRevokeRequest$: Subscription | undefined;

	passwordValidateForm: FormGroup = this.formBuilder.group<PasswordValidateForm>({
		password: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.pattern(this.helperService.getRegex('password'))
		])
	});
	passwordValidateFormRequest$: Subscription | undefined;
	passwordValidateToggle: boolean = false;

	emailForm: FormGroup = this.formBuilder.group<EmailForm>({
		email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email])
	});
	emailFormRequest$: Subscription | undefined;
	emailFormConfirmationIsSubmitted: boolean = false;

	passwordForm: FormGroup = this.formBuilder.group<PasswordForm>({
		password: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.pattern(this.helperService.getRegex('password'))
		])
	});
	passwordFormRequest$: Subscription | undefined;

	ngOnInit(): void {
		/** Apply Data */

		this.setSkeleton();
		this.setResolver();
	}

	ngOnDestroy(): void {
		[
			this.currentUser$,
			this.currentUserLogoutRequest$,
			this.currentUserLogoutRevokeRequest$,
			this.passwordValidateFormRequest$,
			this.emailFormRequest$,
			this.passwordFormRequest$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.currentUserSkeletonToggle = true;
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			this.currentUser$?.unsubscribe();
			this.currentUser$ = this.authorizationService
				.getCurrentUser()
				.pipe(filter((currentUser: CurrentUser | undefined) => !!currentUser))
				.subscribe({
					next: (currentUser: CurrentUser | undefined) => {
						this.currentUser = currentUser;
						this.currentUserSkeletonToggle = false;

						if (!this.currentUser.firebase.emailVerified) {
							this.emailForm.get('email').setValue(this.currentUser.firebase.email);
							this.emailForm.disable();
						}
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	onSubmitPasswordValidateForm(): void {
		if (this.helperService.getFormValidation(this.passwordValidateForm)) {
			this.passwordValidateForm.disable();

			const passwordValidateGetDto: PasswordValidateGetDto = {
				...this.passwordValidateForm.value
			};

			this.passwordValidateFormRequest$?.unsubscribe();
			this.passwordValidateFormRequest$ = this.passwordService
				.onValidate(passwordValidateGetDto)
				.subscribe({
					next: () => {
						/** Pass password to appUserDeleteComponent */

						// prettier-ignore
						this.appUserDeleteComponent.userDeleteFormPassword = this.passwordValidateForm.value.password;

						/** Reset form and change view */

						this.passwordValidateForm.enable();
						this.passwordValidateForm.reset();

						this.passwordValidateToggle = true;
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

			this.emailFormRequest$?.unsubscribe();
			this.emailFormRequest$ = this.emailService.onUpdate(emailUpdateDto).subscribe({
				next: () => {
					this.emailForm.enable();
					this.emailForm.reset();

					this.snackbarService.success('All right', 'We sent you a verification email');
				},
				error: () => this.emailForm.enable()
			});
		}
	}

	onSubmitEmailConfirmation(): void {
		if (this.helperService.getFormValidation(this.emailForm)) {
			this.emailFormConfirmationIsSubmitted = true;

			this.emailFormRequest$?.unsubscribe();
			this.emailFormRequest$ = this.emailService.onConfirmationGet().subscribe({
				next: () => {
					this.emailFormConfirmationIsSubmitted = false;

					this.snackbarService.warning('All right', 'We sent you a verification email');
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

			this.passwordFormRequest$?.unsubscribe();
			this.passwordFormRequest$ = this.passwordService.onUpdate(passwordUpdateDto).subscribe({
				next: () => {
					this.passwordForm.enable();
					this.passwordForm.reset();

					this.snackbarService.success('Success', 'Password has been changed');
				},
				error: () => this.passwordForm.enable()
			});
		}
	}

	onSubmitLogoutRevoke(): void {
		this.currentUserLogoutRevokeRequestIsSubmitted = true;

		this.currentUserLogoutRevokeRequest$?.unsubscribe();
		this.currentUserLogoutRevokeRequest$ = this.authorizationService.onLogoutRevoke().subscribe({
			next: () => {
				this.router.navigateByUrl('/').then(() => {
					this.snackbarService.success('As you wish..', 'We have revoked all tokens');
				});
			},
			error: () => (this.currentUserLogoutRevokeRequestIsSubmitted = false)
		});
	}

	onToggleDeleteForm(toggle: boolean): void {
		if (toggle) {
			this.emailForm.disable();
			this.passwordForm.disable();
		} else {
			this.emailForm.enable();
			this.passwordForm.enable();
		}
	}

	onSubmitDeleteForm(): void {
		this.currentUserLogoutRequest$?.unsubscribe();
		this.currentUserLogoutRequest$ = this.authorizationService
			.onLogout()
			.pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					this.router
						.navigate(['/error', httpErrorResponse.status])
						.then(() => console.debug('Route changed'));

					return throwError(() => httpErrorResponse);
				})
			)
			.subscribe({
				next: () => this.router.navigateByUrl('/').then(() => console.debug('Route changed')),
				error: (error: any) => console.error(error)
			});
	}
}
