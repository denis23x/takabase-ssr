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
import { PasswordResetUpdateDto } from '../../core/dto/password/password-reset-update.dto';
import { SnackbarService } from '../../core/services/snackbar.service';
import { OauthComponent } from '../../standalone/components/oauth/oauth.component';
import { PasswordService } from '../../core/services/password.service';

interface PasswordForm {
	code: FormControl<string>;
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
		private router: Router,
		private snackbarService: SnackbarService,
		private passwordService: PasswordService
	) {
		this.passwordForm = this.formBuilder.group<PasswordForm>({
			code: this.formBuilder.nonNullable.control('', [Validators.required]),
			password: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.pattern(this.helperService.getRegex('password'))
			])
		});
	}

	ngOnInit(): void {
		// prettier-ignore
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams.subscribe({
      next: (params: Params) => this.passwordForm.get('code').setValue(params.oobCode),
      error: (error: any) => console.error(error)
    });
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.activatedRouteQueryParams$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onSubmitPasswordForm(): void {
		if (this.helperService.getFormValidation(this.passwordForm)) {
			this.passwordForm.disable();

			const passwordResetUpdateDto: PasswordResetUpdateDto = {
				...this.passwordForm.value
			};

			this.passwordService.onResetUpdate(passwordResetUpdateDto).subscribe({
				next: () => {
					// prettier-ignore
					this.router
            .navigate(['/'])
            .then(() => this.snackbarService.success('Success', 'Password has been changed'));
				},
				error: () => this.passwordForm.enable()
			});
		}
	}
}
