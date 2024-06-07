/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MetaOpenGraph, MetaTwitter } from '../../../core/models/meta.model';
import { MetaService } from '../../../core/services/meta.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { EmailConfirmationUpdateDto } from '../../../core/dto/email/email-confirmation-update.dto';
import { EmailService } from '../../../core/services/email.service';
import { SvgIconComponent } from '../../../standalone/components/svg-icon/svg-icon.component';
import { Subscription } from 'rxjs';
import { PlatformService } from '../../../core/services/platform.service';
import { CurrentUser } from '../../../core/models/current-user.model';
import { AuthorizationService } from '../../../core/services/authorization.service';
import { UserUrlPipe } from '../../../standalone/pipes/user-url.pipe';
import { filter } from 'rxjs/operators';
import { SkeletonDirective } from '../../../standalone/directives/app-skeleton.directive';
import { AuthenticatedComponent } from '../../../standalone/components/authenticated/authenticated.component';

@Component({
	standalone: true,
	imports: [RouterModule, SvgIconComponent, UserUrlPipe, SkeletonDirective, AuthenticatedComponent],
	selector: 'app-authorization-confirmation-email',
	templateUrl: './email.component.html'
})
export class AuthConfirmationEmailComponent implements OnInit, OnDestroy {
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly emailService: EmailService = inject(EmailService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	currentUserSkeletonToggle: boolean = true;
	currentUserSkeletonToggle$: Subscription | undefined;

	confirmationRequest$: Subscription | undefined;
	confirmationRequestToggle: boolean = true;
	confirmationRequestIsSucceed: boolean = false;

	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser | undefined) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});

		this.currentUserSkeletonToggle$?.unsubscribe();
		this.currentUserSkeletonToggle$ = this.authorizationService.currentUserIsPopulated
			.pipe(filter((currentUserIsPopulated: boolean) => currentUserIsPopulated))
			.subscribe({
				next: () => (this.currentUserSkeletonToggle = false),
				error: (error: any) => console.error(error)
			});

		/** Apply Data */

		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.currentUser$, this.currentUserSkeletonToggle$, this.confirmationRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			this.confirmationRequestToggle = true;

			const oobCode: string = String(this.activatedRoute.snapshot.queryParamMap.get('oobCode') || '');

			const emailConfirmationUpdateDto: EmailConfirmationUpdateDto = {
				code: oobCode
			};

			this.confirmationRequest$?.unsubscribe();
			this.confirmationRequest$ = this.emailService.onConfirmationUpdate(emailConfirmationUpdateDto).subscribe({
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
