/** @format */

import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	inject,
	OnDestroy,
	OnInit,
	Output,
	signal,
	ViewChild,
	WritableSignal
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { InputTrimWhitespaceDirective } from '../../../directives/app-input-trim-whitespace.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription, switchMap } from 'rxjs';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { AuthorizationService } from '../../../../core/services/authorization.service';
import { PasswordService } from '../../../../core/services/password.service';
import { PlatformService } from '../../../../core/services/platform.service';
import type { CurrentUser } from '../../../../core/models/current-user.model';
import type { PasswordResetGetDto } from '../../../../core/dto/password/password-reset-get.dto';

@Component({
	standalone: true,
	imports: [
		CommonModule,
		SvgIconComponent,
		WindowComponent,
		InputTrimWhitespaceDirective,
		ReactiveFormsModule,
		BadgeErrorComponent
	],
	providers: [PasswordService],
	selector: 'app-user-password-reset, [appUserPasswordReset]',
	templateUrl: './password-reset.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPasswordResetComponent implements OnInit, OnDestroy {
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly router: Router = inject(Router);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly passwordService: PasswordService = inject(PasswordService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly location: Location = inject(Location);

	// prettier-ignore
	@ViewChild('userPasswordResetDialogElement') userPasswordResetDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appUserPasswordResetSuccess: EventEmitter<void> = new EventEmitter<void>();
	@Output() appUserPasswordResetToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	currentUser: CurrentUser | null;
	currentUser$: Subscription | undefined;

	userPasswordResetRequest$: Subscription | undefined;
	userPasswordResetDialogIsSubmitted: WritableSignal<boolean> = signal(false);

	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser | null) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});

		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onToggleUserPasswordResetDialog(false));
		}
	}

	ngOnDestroy(): void {
		[this.currentUser$, this.userPasswordResetRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleUserPasswordResetDialog(toggle: boolean): void {
		if (toggle) {
			this.userPasswordResetDialogElement.nativeElement.showModal();
		} else {
			this.userPasswordResetDialogElement.nativeElement.close();
		}

		this.appUserPasswordResetToggle.emit(toggle);
	}

	onSubmitUserPasswordResetDialog(): void {
		this.userPasswordResetDialogIsSubmitted.set(true);

		const passwordResetGetDto: PasswordResetGetDto = {
			email: this.currentUser.firebase.email
		};

		this.userPasswordResetRequest$?.unsubscribe();
		this.userPasswordResetRequest$ = this.passwordService
			.onResetSendEmail(passwordResetGetDto)
			.pipe(switchMap(() => this.authorizationService.onLogoutRevoke()))
			.subscribe({
				next: () => {
					this.appUserPasswordResetSuccess.emit();

					this.userPasswordResetDialogIsSubmitted.set(false);

					this.onToggleUserPasswordResetDialog(false);

					this.router.navigateByUrl('/').then(() => {
						this.snackbarService.warning('Okay', 'Check your email to continue process');
					});
				},
				error: () => this.userPasswordResetDialogIsSubmitted.set(false)
			});
	}
}
