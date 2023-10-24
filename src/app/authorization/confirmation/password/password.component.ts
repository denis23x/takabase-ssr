/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SvgIconComponent } from '../../../standalone/components/svg-icon/svg-icon.component';
import { HelperService } from '../../../core/services/helper.service';
import { AppInputTrimWhitespaceDirective } from '../../../standalone/directives/app-input-trim-whitespace.directive';
import { Subscription } from 'rxjs';
import { PasswordResetUpdateDto } from '../../../core/dto/password/password-reset-update.dto';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { PasswordService } from '../../../core/services/password.service';
import { MetaOpenGraph, MetaTwitter } from '../../../core/models/meta.model';
import { MetaService } from '../../../core/services/meta.service';

interface PasswordForm {
	code: FormControl<string>;
	password: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, SvgIconComponent, AppInputTrimWhitespaceDirective],
	selector: 'app-authorization-confirmation-password',
	templateUrl: './password.component.html'
})
export class AuthConfirmationPasswordComponent implements OnInit, OnDestroy {
	activatedRouteQueryParams$: Subscription | undefined;

	passwordForm: FormGroup | undefined;
	passwordForm$: Subscription | undefined;

	constructor(
		private formBuilder: FormBuilder,
		private metaService: MetaService,
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

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.activatedRouteQueryParams$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setMetaTags(): void {
		const title: string = 'Password reset';

		// prettier-ignore
		const description: string = 'Follow the simple steps to regain access to your account';

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
