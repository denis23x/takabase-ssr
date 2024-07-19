/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SvgIconComponent } from '../../../standalone/components/svg-icon/svg-icon.component';
import { HelperService } from '../../../core/services/helper.service';
import { InputTrimWhitespaceDirective } from '../../../standalone/directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { PasswordService } from '../../../core/services/password.service';
import { MetaService } from '../../../core/services/meta.service';
import { Subscription } from 'rxjs';
import { BadgeErrorComponent } from '../../../standalone/components/badge-error/badge-error.component';
import { InputShowPassword } from '../../../standalone/directives/app-input-show-password.directive';
import type { PasswordResetUpdateDto } from '../../../core/dto/password/password-reset-update.dto';
import type { MetaOpenGraph, MetaTwitter } from '../../../core/models/meta.model';

interface PasswordForm {
	code: FormControl<string>;
	password: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		ReactiveFormsModule,
		SvgIconComponent,
		InputTrimWhitespaceDirective,
		BadgeErrorComponent,
		InputShowPassword
	],
	providers: [PasswordService],
	selector: 'app-authorization-confirmation-password',
	templateUrl: './password.component.html'
})
export class AuthConfirmationPasswordComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly router: Router = inject(Router);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly passwordService: PasswordService = inject(PasswordService);

	passwordRequest$: Subscription | undefined;
	passwordForm: FormGroup = this.formBuilder.group<PasswordForm>({
		code: this.formBuilder.nonNullable.control('', [Validators.required]),
		password: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(6),
			Validators.maxLength(48),
			Validators.pattern(this.helperService.getRegex('password'))
		])
	});

	ngOnInit(): void {
		/** Apply Data */

		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.passwordRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setResolver(): void {
		const oobCode: string = String(this.activatedRoute.snapshot.queryParamMap.get('oobCode') || '');

		this.passwordForm.get('code').setValue(oobCode);
	}

	setMetaTags(): void {
		const title: string = 'Password reset';
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

			this.passwordRequest$?.unsubscribe();
			this.passwordRequest$ = this.passwordService.onReset(passwordResetUpdateDto).subscribe({
				next: () => {
					this.router.navigate(['/']).then(() => this.snackbarService.success('Success', 'Password has been changed'));
				},
				error: () => this.passwordForm.enable()
			});
		}
	}
}
