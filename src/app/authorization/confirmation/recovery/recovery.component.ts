/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, RouterModule } from '@angular/router';
import { MetaOpenGraph, MetaTwitter } from '../../../core/models/meta.model';
import { MetaService } from '../../../core/services/meta.service';
import { Subscription } from 'rxjs';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { CommonModule } from '@angular/common';
import { EmailService } from '../../../core/services/email.service';
import { SvgIconComponent } from '../../../standalone/components/svg-icon/svg-icon.component';
import { EmailRecoveryDto } from '../../../core/dto/email/email-recovery.dto';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, SvgIconComponent],
	selector: 'app-authorization-recovery-recovery',
	templateUrl: './recovery.component.html'
})
export class AuthConfirmationRecoveryComponent implements OnInit, OnDestroy {
	activatedRouteQueryParams$: Subscription | undefined;

	recoveryIsSucceed: boolean = false;
	recoveryIsSubmitted: boolean = true;

	constructor(
		private activatedRoute: ActivatedRoute,
		private metaService: MetaService,
		private emailService: EmailService,
		private snackbarService: SnackbarService
	) {}

	ngOnInit(): void {
		this.activatedRouteQueryParams$ = this.activatedRoute.queryParams.subscribe({
			next: (params: Params) => {
				const emailRecoveryDto: EmailRecoveryDto = {
					code: params.oobCode
				};

				this.emailService.onRecovery(emailRecoveryDto).subscribe({
					next: () => {
						this.recoveryIsSucceed = true;
						this.recoveryIsSubmitted = false;

						// prettier-ignore
						this.snackbarService.success('Hooray, it worked', 'Email successfully restored');
					},
					error: () => (this.recoveryIsSubmitted = false)
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
		const title: string = 'Email recovery';

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
}
