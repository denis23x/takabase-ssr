/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { MetaOpenGraph, MetaTwitter } from '../../../core/models/meta.model';
import { MetaService } from '../../../core/services/meta.service';
import { Subscription } from 'rxjs';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { CommonModule } from '@angular/common';
import { EmailConfirmationUpdateDto } from '../../../core/dto/email/email-confirmation-update.dto';
import { EmailService } from '../../../core/services/email.service';
import { SvgIconComponent } from '../../../standalone/components/svg-icon/svg-icon.component';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SvgIconComponent],
	selector: 'app-auth-confirmation-email',
	templateUrl: './email.component.html'
})
export class AuthConfirmationEmailComponent implements OnInit, OnDestroy {
	activatedRouteQueryParams$: Subscription | undefined;

	confirmationIsSucceed: boolean = false;
	confirmationIsSubmitted: boolean = true;

	constructor(
		private activatedRoute: ActivatedRoute,
		private metaService: MetaService,
		private emailService: EmailService,
		private snackbarService: SnackbarService
	) {}

	ngOnInit(): void {
		// prettier-ignore
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams.subscribe({
      next: (params: Params) => {
				const emailConfirmationUpdateDto: EmailConfirmationUpdateDto = {
					code: params.oobCode
				};

				this.emailService
					.onConfirmationUpdate(emailConfirmationUpdateDto)
					.subscribe({
						next: () => {
							this.confirmationIsSucceed = true;
							this.confirmationIsSubmitted = false;

							this.snackbarService.success('Great', 'Email successfully confirmed');
						},
						error: () => (this.confirmationIsSubmitted = false)
					});
      },
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
		const title: string = 'Email confirmation';
		const description: string = 'Thank you for verifying your email address';

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
}
