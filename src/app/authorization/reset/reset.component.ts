/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { HelperService } from '../../core/services/helper.service';
import { MetaService } from '../../core/services/meta.service';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { InputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../core/services/snackbar.service';
import { PasswordResetGetDto } from '../../core/dto/password/password-reset-get.dto';
import { PasswordService } from '../../core/services/password.service';
import { Subscription } from 'rxjs';
import { BadgeErrorComponent } from '../../standalone/components/badge-error/badge-error.component';

interface ResetForm {
	email: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		RouterModule,
		ReactiveFormsModule,
		SvgIconComponent,
		InputTrimWhitespaceDirective,
		BadgeErrorComponent
	],
	selector: 'app-authorization-reset',
	templateUrl: './reset.component.html'
})
export class AuthResetComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly passwordService: PasswordService = inject(PasswordService);

	resetRequest$: Subscription | undefined;
	resetForm: FormGroup = this.formBuilder.group<ResetForm>({
		email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email])
	});

	ngOnInit(): void {
		/** Apply Data */

		// Nothing to apply

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.resetRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setMetaTags(): void {
		const title: string = 'Reset password';
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

			this.resetRequest$?.unsubscribe();
			this.resetRequest$ = this.passwordService.onResetGet(passwordResetGetDto).subscribe({
				next: () => {
					this.snackbarService.info('Success', 'Check your email to continue process');

					this.resetForm.reset();
					this.resetForm.enable();
				},
				error: () => this.resetForm.enable()
			});
		}
	}
}
