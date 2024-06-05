/** @format */

import { Component, computed, inject, OnDestroy, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormControlStatus,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { from, Subscription } from 'rxjs';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { HelperService } from '../../core/services/helper.service';
import { InputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../core/services/snackbar.service';
import { PasswordValidateGetDto } from '../../core/dto/password/password-validate-get.dto';
import { PasswordService } from '../../core/services/password.service';
import { EmailService } from '../../core/services/email.service';
import { PasswordUpdateDto } from '../../core/dto/password/password-update.dto';
import { CurrentUser, CurrentUserProviderData } from '../../core/models/current-user.model';
import { AuthorizationService } from '../../core/services/authorization.service';
import { BadgeErrorComponent } from '../../standalone/components/badge-error/badge-error.component';
import { PlatformService } from '../../core/services/platform.service';
import { filter } from 'rxjs/operators';
import { UserDeleteComponent } from '../../standalone/components/user/delete/delete.component';
import { WindowComponent } from '../../standalone/components/window/window.component';
import {
	UserInfo,
	unlink,
	linkWithPopup,
	AuthProvider,
	UserCredential,
	User as FirebaseUser,
	EmailAuthProvider,
	EmailAuthCredential,
	linkWithCredential
} from 'firebase/auth';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserPasswordReset } from '../../standalone/components/user/password-reset/password-reset.component';
import { EmailUpdateDto } from '../../core/dto/email/email-update.dto';
import { InputShowPassword } from '../../standalone/directives/app-input-show-password.directive';

interface EmailAuthProviderForm {
	email: FormControl<string>;
	password: FormControl<string>;
}

interface CurrentUserEmailForm {
	email: FormControl<string>;
}

interface CurrentUserPasswordForm {
	password: FormControl<string>;
}

interface NewEmailForm {
	newEmail: FormControl<string>;
}

interface NewPasswordForm {
	newPassword: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		RouterModule,
		CommonModule,
		ReactiveFormsModule,
		SvgIconComponent,
		InputTrimWhitespaceDirective,
		BadgeErrorComponent,
		UserDeleteComponent,
		WindowComponent,
		UserPasswordReset,
		InputShowPassword
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

	formIsDisabled: Signal<boolean> = computed(() => {
		const isSubmittedSuspect: boolean[] = [
			this.emailAuthProviderFormIsSubmitted() === 'DISABLED',
			this.currentUserEmailFormIsSubmitted(),
			this.currentUserPasswordFormIsSubmitted() === 'DISABLED',
			this.currentUserProviderDataRequestIsSubmitted() !== undefined,
			this.currentUserLogoutRevokeRequestIsSubmitted(),
			this.newEmailFormIsSubmitted() === 'DISABLED',
			this.newPasswordFormIsSubmitted() === 'DISABLED'
		];

		return isSubmittedSuspect.some((isSubmitted: boolean) => !!isSubmitted);
	});

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;
	currentUserProviderData: CurrentUserProviderData[] = [];
	currentUserProviderDataRequestIsSubmitted: WritableSignal<string | undefined> = signal(undefined);

	emailAuthProviderForm: FormGroup = this.formBuilder.group<EmailAuthProviderForm>({
		email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
		password: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(6),
			Validators.maxLength(48),
			Validators.pattern(this.helperService.getRegex('password'))
		])
	});
	emailAuthProviderFormToggle: boolean = false;
	emailAuthProviderFormRequest$: Subscription | undefined;
	emailAuthProviderFormIsSubmitted: Signal<FormControlStatus> = toSignal(this.emailAuthProviderForm.statusChanges);

	currentUserEmailForm: FormGroup = this.formBuilder.group<CurrentUserEmailForm>({
		email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email])
	});
	currentUserEmailFormRequest$: Subscription | undefined;
	currentUserEmailFormIsSubmitted: WritableSignal<boolean> = signal(false);

	currentUserPasswordForm: FormGroup = this.formBuilder.group<CurrentUserPasswordForm>({
		password: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(6),
			Validators.maxLength(48),
			Validators.pattern(this.helperService.getRegex('password'))
		])
	});
	currentUserPasswordFormFormToggle: boolean = false;
	currentUserPasswordFormRequest$: Subscription | undefined;
	currentUserPasswordFormIsSubmitted: Signal<FormControlStatus> = toSignal(this.currentUserPasswordForm.statusChanges);

	newEmailForm: FormGroup = this.formBuilder.group<NewEmailForm>({
		newEmail: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email])
	});
	newEmailFormRequest$: Subscription | undefined;
	newEmailFormIsSubmitted: Signal<FormControlStatus> = toSignal(this.newEmailForm.statusChanges);

	newPasswordForm: FormGroup = this.formBuilder.group<NewPasswordForm>({
		newPassword: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(6),
			Validators.maxLength(48),
			Validators.pattern(this.helperService.getRegex('password'))
		])
	});
	newPasswordFormRequest$: Subscription | undefined;
	newPasswordFormIsSubmitted: Signal<FormControlStatus> = toSignal(this.newPasswordForm.statusChanges);

	currentUserLogoutRevokeRequest$: Subscription | undefined;
	currentUserLogoutRevokeRequestIsSubmitted: WritableSignal<boolean> = signal(false);

	ngOnInit(): void {
		/** Apply Data */

		this.setResolver();
	}

	ngOnDestroy(): void {
		[
			this.emailAuthProviderFormRequest$,
			this.currentUser$,
			this.currentUserEmailFormRequest$,
			this.currentUserPasswordFormRequest$,
			this.currentUserLogoutRevokeRequest$,
			this.newEmailFormRequest$,
			this.newPasswordFormRequest$
		].forEach(($: Subscription) => $?.unsubscribe());
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

						// Set email for verification

						if (!this.currentUser.firebase.emailVerified) {
							const abstractControl: AbstractControl = this.currentUserEmailForm.get('email');

							abstractControl.setValue(this.currentUser.firebase.email);
							abstractControl.disable();
						}

						// Set provider data

						this.onProviderDataChange(this.currentUser.firebase);
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	/** PROVIDER */

	onProviderDataChange(firebaseUser: FirebaseUser): void {
		const currentUserProviderData: CurrentUserProviderData[] = [
			{
				providerId: 'password',
				providerLabel: 'Takabase',
				providerIcon: './assets/icons/favicon/icon-256x256.png',
				providerLink: 'https://takabase.com',
				linked: false
			},
			{
				providerId: 'google.com',
				providerLabel: 'Google',
				providerIcon: './assets/icons/socials/google.svg',
				providerLink: 'https://google.com',
				linked: false
			},
			{
				providerId: 'facebook.com',
				providerLabel: 'Facebook',
				providerIcon: './assets/icons/socials/facebook.svg',
				providerLink: 'https://facebook.com',
				linked: false
			},
			{
				providerId: 'github.com',
				providerLabel: 'Github',
				providerIcon: './assets/icons/socials/github.svg',
				providerLink: 'https://github.com',
				linked: false
			}
		];

		// prettier-ignore
		this.currentUserProviderData = currentUserProviderData.map((providerData: CurrentUserProviderData) => {
			const userInfo: UserInfo = firebaseUser.providerData.find((userInfo: UserInfo) => {
				return userInfo.providerId === providerData.providerId;
			});

			if (userInfo) {
				providerData = {
					...providerData,
					...userInfo,
					linked: true
				}
			}

			return providerData;
		});
	}

	onProviderLink(currentUserProviderData: CurrentUserProviderData): void {
		// prettier-ignore
		const authProvider: AuthProvider = this.authorizationService.getAuthProvider(currentUserProviderData.providerId);

		from(linkWithPopup(this.currentUser.firebase, authProvider)).subscribe({
			next: (userCredential: UserCredential) => {
				this.authorizationService.setCurrentUser({
					firebase: userCredential.user
				});

				this.snackbarService.success('Done', 'This social account has been linked');
			},
			error: (error: any) => console.error(error)
		});
	}

	onProviderUnlink(currentUserProviderData: CurrentUserProviderData): void {
		this.currentUserProviderDataRequestIsSubmitted.set(currentUserProviderData.providerId);

		from(unlink(this.currentUser.firebase, currentUserProviderData.providerId)).subscribe({
			next: (firebaseUser: FirebaseUser) => {
				this.currentUserProviderDataRequestIsSubmitted.set(undefined);

				this.authorizationService.setCurrentUser({
					firebase: firebaseUser
				});

				this.snackbarService.warning('Done', 'Sign-in method has been removed');
			},
			error: (error: any) => console.error(error)
		});
	}

	/** EMAIL AUTH PROVIDER */

	onToggleEmailAuthProviderForm(): void {
		this.emailAuthProviderFormToggle = !this.emailAuthProviderFormToggle;
	}

	onSubmitEmailAuthProviderForm(): void {
		// prettier-ignore
		if (this.helperService.getFormValidation(this.emailAuthProviderForm)) {
			this.emailAuthProviderForm.disable();

			const email: string = this.emailAuthProviderForm.value.email;
			const password: string = this.emailAuthProviderForm.value.password;

			const emailAuthCredential: EmailAuthCredential = EmailAuthProvider.credential(email, password);

			this.emailAuthProviderFormRequest$?.unsubscribe();
			this.emailAuthProviderFormRequest$ = from(linkWithCredential(this.currentUser.firebase, emailAuthCredential)).subscribe({
				next: (userCredential: UserCredential) => {
					this.authorizationService.setCurrentUser({
						firebase: userCredential.user
					});

					this.snackbarService.success('Nice', 'Your credentials have been applied');

					this.emailAuthProviderForm.enable();
					this.emailAuthProviderForm.reset();
				},
				error: () => this.emailAuthProviderForm.enable()
			});
		}
	}

	/** CURRENT CREDENTIALS */

	onSubmitCurrentUserEmailForm(): void {
		if (this.helperService.getFormValidation(this.currentUserEmailForm)) {
			this.currentUserEmailFormIsSubmitted.set(true);

			this.currentUserEmailFormRequest$?.unsubscribe();
			this.currentUserEmailFormRequest$ = this.emailService.onConfirmationGet().subscribe({
				next: () => {
					this.currentUserEmailFormIsSubmitted.set(false);

					this.snackbarService.success('All right', 'A verification email has been sent');
				},
				error: () => this.currentUserEmailFormIsSubmitted.set(false)
			});
		}
	}

	onSubmitCurrentUserPasswordForm(): void {
		if (this.helperService.getFormValidation(this.currentUserPasswordForm)) {
			this.currentUserPasswordForm.disable();

			const passwordValidateGetDto: PasswordValidateGetDto = {
				...this.currentUserPasswordForm.value
			};

			this.currentUserPasswordFormRequest$?.unsubscribe();
			this.currentUserPasswordFormRequest$ = this.passwordService.onValidate(passwordValidateGetDto).subscribe({
				next: () => {
					this.currentUserPasswordForm.enable();
					this.currentUserPasswordForm.reset();

					// Show newEmail and newPassword

					this.currentUserPasswordFormFormToggle = true;
				},
				error: () => this.currentUserPasswordForm.enable()
			});
		}
	}

	/** NEW CREDENTIALS */

	onSubmitNewEmailForm(): void {
		if (this.helperService.getFormValidation(this.newEmailForm)) {
			this.newEmailForm.disable();

			const emailUpdateDto: EmailUpdateDto = {
				...this.newEmailForm.value
			};

			this.newEmailFormRequest$?.unsubscribe();
			this.newEmailFormRequest$ = this.emailService.onUpdate(emailUpdateDto).subscribe({
				next: () => {
					this.newEmailForm.enable();
					this.newEmailForm.reset();

					this.snackbarService.success('All right', 'A verification email has been sent to you');
				},
				error: () => this.newEmailForm.enable()
			});
		}
	}

	onSubmitNewPasswordForm(): void {
		if (this.helperService.getFormValidation(this.newPasswordForm)) {
			this.newPasswordForm.disable();

			const passwordUpdateDto: PasswordUpdateDto = {
				...this.newPasswordForm.value
			};

			this.newPasswordFormRequest$?.unsubscribe();
			this.newPasswordFormRequest$ = this.passwordService.onUpdate(passwordUpdateDto).subscribe({
				next: () => {
					this.newPasswordForm.enable();
					this.newPasswordForm.reset();

					this.snackbarService.success('Success', 'Password has been changed');
				},
				error: () => this.newPasswordForm.enable()
			});
		}
	}

	/** REVOKE */

	onSubmitLogoutRevoke(): void {
		this.currentUserLogoutRevokeRequestIsSubmitted.set(true);

		this.currentUserLogoutRevokeRequest$?.unsubscribe();
		this.currentUserLogoutRevokeRequest$ = this.authorizationService.onLogoutRevoke().subscribe({
			next: () => {
				this.router.navigateByUrl('/').then(() => {
					this.snackbarService.success('As you wish..', 'All tokens has been revoked');
				});
			},
			error: () => this.currentUserLogoutRevokeRequestIsSubmitted.set(false)
		});
	}
}
