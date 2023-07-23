/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { MetaService } from '../../core/services/meta.service';
import { Subscription } from 'rxjs';
import { User } from '../../core/models/user.model';
import { SnackbarService } from '../../core/services/snackbar.service';
import { CommonModule } from '@angular/common';
import { UserUrlPipe } from '../../standalone/pipes/user-url.pipe';
import { EmailConfirmationUpdateDto } from '../../core/dto/email/email-confirmation-update.dto';
import { EmailService } from '../../core/services/email.service';

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, UserUrlPipe],
	selector: 'app-auth-email-confirmation',
	templateUrl: './email-confirmation.component.html'
})
export class AuthEmailConfirmationComponent implements OnInit, OnDestroy {
	activatedRouteQueryParams$: Subscription | undefined;

	confirmationUser: Partial<User> | undefined;
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
      next: () => {
        const token: string = String(this.activatedRoute.snapshot.queryParamMap.get('token') || '');

        if (token.length) {
          const emailConfirmationUpdateDto: EmailConfirmationUpdateDto = {
            token
          };

          this.emailService
            .onConfirmationUpdate(emailConfirmationUpdateDto)
            .subscribe({
              next: (user: Partial<User>) => {
                this.confirmationUser = user;
                this.confirmationIsSubmitted = false;

                if (this.confirmationUser.emailConfirmed) {
                  this.snackbarService.success('Great', 'Email successfully confirmed');
                }
              },
              error: () => (this.confirmationIsSubmitted = false)
            });
        } else {
          this.confirmationIsSubmitted = false;
        }
      },
      error: (error: any) => console.error(error)
    });

		this.setMeta();
	}

	ngOnDestroy(): void {
		[this.activatedRouteQueryParams$].forEach($ => $?.unsubscribe());
	}

	setMeta(): void {
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
