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
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { InputTrimWhitespaceDirective } from '../../../directives/app-input-trim-whitespace.directive';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription, switchMap } from 'rxjs';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { PasswordService } from '../../../../core/services/password.service';
import { ApiService } from '../../../../core/services/api.service';
import { CurrentUserMixin as CU } from '../../../../core/mixins/current-user.mixin';
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
export class UserPasswordResetComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly router: Router = inject(Router);
	private readonly passwordService: PasswordService = inject(PasswordService);
	private readonly apiService: ApiService = inject(ApiService);

	// prettier-ignore
	@ViewChild('userPasswordResetDialogElement') userPasswordResetDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appUserPasswordResetSuccess: EventEmitter<void> = new EventEmitter<void>();
	@Output() appUserPasswordResetToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	userPasswordResetRequest$: Subscription | undefined;
	userPasswordResetDialogIsSubmitted: WritableSignal<boolean> = signal(false);

	ngOnDestroy(): void {
		[this.userPasswordResetRequest$].forEach(($: Subscription) => $?.unsubscribe());
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
			email: this.currentUser.email
		};

		this.userPasswordResetRequest$?.unsubscribe();
		this.userPasswordResetRequest$ = this.passwordService
			.onResetSendEmail(passwordResetGetDto)
			.pipe(
				switchMap(() => this.apiService.post('/api/v1/authorization/logout/revoke')),
				switchMap(() => this.authorizationService.getSignOut())
			)
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
