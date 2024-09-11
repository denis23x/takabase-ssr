/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MetaService } from '../../../core/services/meta.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { EmailService } from '../../../core/services/email.service';
import { SvgIconComponent } from '../../../standalone/components/svg-icon/svg-icon.component';
import { from, of, Subscription, switchMap } from 'rxjs';
import { PlatformService } from '../../../core/services/platform.service';
import { SkeletonDirective } from '../../../standalone/directives/app-skeleton.directive';
import { AuthenticatedComponent } from '../../../standalone/components/authenticated/authenticated.component';
import { CurrentUserMixin as CU } from '../../../core/mixins/current-user.mixin';
import type { MetaOpenGraph, MetaTwitter } from '../../../core/models/meta.model';
import type { CurrentUser } from '../../../core/models/current-user.model';
import type { EmailConfirmationUpdateDto } from '../../../core/dto/email/email-confirmation-update.dto';

@Component({
	standalone: true,
	imports: [RouterModule, SvgIconComponent, SkeletonDirective, AuthenticatedComponent],
	providers: [EmailService],
	selector: 'app-authorization-confirmation-email',
	templateUrl: './email.component.html'
})
export class AuthConfirmationEmailComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly emailService: EmailService = inject(EmailService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly platformService: PlatformService = inject(PlatformService);

	confirmationRequest$: Subscription | undefined;
	confirmationRequestToggle: boolean = true;
	confirmationRequestIsSucceed: boolean = false;

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// ngOnDestroy

		[this.confirmationRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			this.confirmationRequestToggle = true;

			const oobCode: string = String(this.activatedRoute.snapshot.queryParamMap.get('oobCode') || '');

			const emailConfirmationUpdateDto: EmailConfirmationUpdateDto = {
				code: oobCode
			};

			this.confirmationRequest$?.unsubscribe();
			this.confirmationRequest$ = this.emailService
				.onConfirmationUpdate(emailConfirmationUpdateDto)
				.pipe(
					switchMap(() => this.authorizationService.getPopulate()),
					switchMap((currentUser: CurrentUser | null) => {
						if (currentUser) {
							// Update state

							return from(currentUser.firebase.reload());
						}

						return of(null);
					})
				)
				.subscribe({
					next: () => {
						this.confirmationRequestIsSucceed = true;
						this.confirmationRequestToggle = false;

						this.snackbarService.success('Great', 'Email successfully confirmed');
					},
					error: () => (this.confirmationRequestToggle = false)
				});
		}
	}

	setMetaTags(): void {
		const title: string = 'Email Confirmation - Almost There!';

		// prettier-ignore
		const description: string = 'Thanks for confirming your email with Takabase! Takabase if processing your verification and soon you will be all set to enjoy with full range of features. Please hold on for just a moment, appreciate your patience';

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
