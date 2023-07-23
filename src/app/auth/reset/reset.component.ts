/** @format */

import { Component, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { HelperService } from '../../core/services/helper.service';
import { MetaService } from '../../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { AppInputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../core/services/snackbar.service';
import { OauthComponent } from '../../standalone/components/oauth/oauth.component';
import { PasswordResetGetDto } from '../../core/dto/password/password-reset-get.dto';
import { Subscription } from 'rxjs';
import { PasswordService } from '../../core/services/password.service';

interface ResetForm {
	email: FormControl<string>;
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
	selector: 'app-auth-reset',
	templateUrl: './reset.component.html'
})
export class AuthResetComponent implements OnInit {
	resetForm: FormGroup | undefined;
	resetForm$: Subscription | undefined;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private metaService: MetaService,
		private snackbarService: SnackbarService,
		private passwordService: PasswordService
	) {
		this.resetForm = this.formBuilder.group<ResetForm>({
			email: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.email
			])
		});
	}

	ngOnInit(): void {
		this.setMeta();
	}

	setMeta(): void {
		const title: string = 'Reset password';

		// prettier-ignore
		const description: string = 'To reset your password, please enter your email address below';

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

	onSubmitResetForm(): void {
		if (this.helperService.getFormValidation(this.resetForm)) {
			this.resetForm.disable();

			const passwordResetGetDto: PasswordResetGetDto = {
				...this.resetForm.value
			};

			this.passwordService.onResetGet(passwordResetGetDto).subscribe({
				next: () => {
					// prettier-ignore
					this.snackbarService.success('Success', 'Check your email to continue process');

					this.resetForm.reset();
					this.resetForm.enable();
				},
				error: () => this.resetForm.enable()
			});
		}
	}
}
