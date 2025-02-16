/** @format */

import { Component, inject, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MetaService } from '../../../core/services/meta.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { EmailService } from '../../../core/services/email.service';
import { SvgIconComponent } from '../../../standalone/components/svg-icon/svg-icon.component';
import { Subscription } from 'rxjs';
import { PlatformService } from '../../../core/services/platform.service';
import type { MetaOpenGraph, MetaTwitter } from '../../../core/models/meta.model';
import type { EmailRecoveryDto } from '../../../core/dto/email/email-recovery.dto';

@Component({
	standalone: true,
	imports: [RouterModule, SvgIconComponent],
	providers: [EmailService],
	selector: 'app-authorization-recovery-recovery',
	templateUrl: './recovery.component.html'
})
export class AuthConfirmationRecoveryComponent implements OnInit, OnDestroy {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly emailService: EmailService = inject(EmailService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly platformService: PlatformService = inject(PlatformService);

	recoveryRequest$: Subscription | undefined;
	recoveryIsSucceed: WritableSignal<boolean> = signal(false);
	recoveryIsSubmitted: WritableSignal<boolean> = signal(true);

	ngOnInit(): void {
		/** Apply Data */

		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[this.recoveryRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			const oobCode: string = String(this.activatedRoute.snapshot.queryParamMap.get('oobCode') || '');

			const emailRecoveryDto: EmailRecoveryDto = {
				code: oobCode
			};

			this.recoveryRequest$?.unsubscribe();
			this.recoveryRequest$ = this.emailService.onRecovery(emailRecoveryDto).subscribe({
				next: () => {
					this.recoveryIsSucceed.set(true);
					this.recoveryIsSubmitted.set(false);

					this.snackbarService.success('Hooray, it worked', 'Email successfully restored');
				},
				error: () => this.recoveryIsSubmitted.set(false)
			});
		}
	}

	setMetaTags(): void {
		const title: string = 'Email Recovery - Get Back In Now';

		// prettier-ignore
		const description: string = 'Regain access to your account through Takabase is secure and simple recovery process. Just follow the easy steps provided, and you will be back in control of your account in no time, with the highest level of security';

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
