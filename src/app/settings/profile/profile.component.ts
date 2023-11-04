/** @format */

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { startWith, switchMap, tap } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { CropperComponent } from '../../standalone/components/cropper/cropper.component';
import { WindowComponent } from '../../standalone/components/window/window.component';
import { AppInputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { DayjsPipe } from '../../standalone/pipes/dayjs.pipe';
import { UserUrlPipe } from '../../standalone/pipes/user-url.pipe';
import { HelperService } from '../../core/services/helper.service';
import { UserService } from '../../core/services/user.service';
import { AuthorizationService } from '../../core/services/authorization.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { UserUpdateDto } from '../../core/dto/user/user-update.dto';
import { AppTextareaResizeDirective } from '../../standalone/directives/app-textarea-resize.directive';
import { AppQrCodeDirective } from '../../standalone/directives/app-qr-code.directive';
import { PlatformService } from '../../core/services/platform.service';
import { CurrentUser } from '../../core/models/current-user.model';
import { User } from '../../core/models/user.model';

interface ProfileForm {
	name: FormControl<string>;
	description: FormControl<string | null>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		SvgIconComponent,
		AvatarComponent,
		CropperComponent,
		WindowComponent,
		DayjsPipe,
		UserUrlPipe,
		AppInputTrimWhitespaceDirective,
		AppTextareaResizeDirective,
		AppQrCodeDirective
	],
	selector: 'app-settings-profile',
	templateUrl: './profile.component.html'
})
export class SettingsProfileComponent implements OnInit, OnDestroy {
	// prettier-ignore
	@ViewChild('profileFormAvatarDialog') profileFormAvatarDialog: ElementRef<HTMLDialogElement> | undefined;
	@ViewChild('QRCodeDialog') QRCodeDialog: ElementRef<HTMLDialogElement> | undefined;

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;
	currentUserRequest$: Subscription | undefined;
	currentUserQRCodeUrl: string | undefined;

	profileForm: FormGroup | undefined;
	profileFormIsPristine: boolean = false;
	profileFormIsPristine$: Subscription | undefined;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private userService: UserService,
		private authorizationService: AuthorizationService,
		private snackbarService: SnackbarService,
		private platformService: PlatformService
	) {
		this.profileForm = this.formBuilder.group<ProfileForm>({
			name: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(24),
				Validators.pattern(this.helperService.getRegex('no-whitespace'))
			]),
			description: this.formBuilder.control(null, [Validators.maxLength(255)])
		});
	}

	ngOnInit(): void {
		/** Apply Data */

		this.setResolver();
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.currentUser$, this.currentUserRequest$, this.profileFormIsPristine$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setResolver(): void {
		this.currentUser$ = this.authorizationService
			.getCurrentUser()
			.pipe(tap((currentUser: CurrentUser) => (this.currentUser = currentUser)))
			.subscribe({
				next: () => {
					this.profileForm.patchValue(this.currentUser);
					this.profileForm.markAllAsTouched();
					this.profileFormIsPristine$ = this.profileForm.valueChanges
						.pipe(startWith(this.profileForm.value))
						.subscribe({
							next: (value: any) => {
								this.profileFormIsPristine = Object.keys(value).every((key: string) => {
									return value[key] === this.currentUser[key];
								});
							},
							error: (error: any) => console.error(error)
						});
				},
				error: (error: any) => console.error(error)
			});
	}

	onToggleProfileFormAvatar(toggle: boolean): void {
		if (toggle) {
			this.profileForm.disable();
			this.profileFormAvatarDialog.nativeElement.showModal();
		} else {
			this.profileForm.enable();
			this.profileFormAvatarDialog.nativeElement.close();
		}
	}

	onToggleQRCode(toggle: boolean): void {
		if (toggle) {
			if (this.platformService.isBrowser()) {
				const window: Window = this.platformService.getWindow();

				// prettier-ignore
				this.currentUserQRCodeUrl = window.location.origin + this.userService.getUserUrl(this.currentUser);
			}

			this.QRCodeDialog.nativeElement.showModal();
		} else {
			this.QRCodeDialog.nativeElement.close();
		}
	}

	onSubmitCropper(fileUrl: string): void {
		this.onToggleProfileFormAvatar(false);

		const userUpdateDto: UserUpdateDto = {
			avatar: fileUrl
		};

		this.currentUserRequest$?.unsubscribe();
		this.currentUserRequest$ = this.userService
			.update(this.currentUser.id, userUpdateDto)
			.pipe(switchMap((user: User) => this.authorizationService.setCurrentUser(user)))
			.subscribe({
				next: () => {
					this.snackbarService.success('Success', 'Avatar has been updated');
				},
				error: (error: any) => console.error(error)
			});
	}

	onSubmitProfileForm(): void {
		if (this.helperService.getFormValidation(this.profileForm)) {
			this.profileForm.disable();

			const userUpdateDto: UserUpdateDto = {
				...this.profileForm.value
			};

			this.currentUserRequest$?.unsubscribe();
			this.currentUserRequest$ = this.userService
				.update(this.currentUser.id, userUpdateDto)
				.pipe(switchMap((user: User) => this.authorizationService.setCurrentUser(user)))
				.subscribe({
					next: () => {
						this.snackbarService.success('Success', 'Information has been updated');

						this.profileFormIsPristine = true;
						this.profileForm.enable();
					},
					error: () => this.profileForm.enable()
				});
		}
	}
}
