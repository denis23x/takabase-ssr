/** @format */

import {
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewChild
} from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { ActivatedRoute, Data, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../shared/components/svg-icon/svg-icon.component';
import { OverlayComponent } from '../../shared/components/overlay/overlay.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { CropperComponent } from '../../shared/components/cropper/cropper.component';
import { WindowComponent } from '../../shared/components/window/window.component';
import { AppInputTrimWhitespaceDirective } from '../../shared/directives/app-input-trim-whitespace.directive';
import { DayjsPipe } from '../../shared/pipes/dayjs.pipe';
import { UserUrlPipe } from '../../shared/pipes/user-url.pipe';
import { User } from '../../core/models/user.model';
import { HelperService } from '../../core/services/helper.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { FileCreateDto } from '../../core/dto/file/file-create.dto';
import { UserUpdateDto } from '../../core/dto/user/user-update.dto';
import { AppInputMarkAsTouchedDirective } from '../../shared/directives/app-input-mark-as-touched.directive';
import { PlatformService } from '../../core/services/platform.service';
import QRCode, { QRCodeRenderersOptions } from 'qrcode';

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
		OverlayComponent,
		AvatarComponent,
		CropperComponent,
		WindowComponent,
		DayjsPipe,
		AppInputTrimWhitespaceDirective,
		UserUrlPipe,
		AppInputMarkAsTouchedDirective
	],
	selector: 'app-settings-profile',
	templateUrl: './profile.component.html'
})
export class SettingsProfileComponent implements OnInit, OnDestroy {
	@ViewChild('avatarInput') avatarInput: ElementRef | undefined;

	@ViewChild('QRCodeCanvas') QRCodeCanvas: ElementRef | undefined;

	activatedRouteData$: Subscription | undefined;

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	profileForm: FormGroup | undefined;
	profileForm$: Subscription | undefined;
	profileFormIsPristine: boolean = false;
	profileFormIsSubmitted: boolean = false;
	profileFormAvatarToggle: boolean = false;

	QRCodeText: string | undefined;
	QRCodeOptions: QRCodeRenderersOptions = {
		margin: 2,
		scale: 1,
		width: 384
	};
	QRCodeToggle: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private authService: AuthService,
		private snackbarService: SnackbarService,
		private platformService: PlatformService
	) {
		this.profileForm = this.formBuilder.group<ProfileForm>({
			name: this.formBuilder.nonNullable.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(24)
			]),
			description: this.formBuilder.control(null, [Validators.maxLength(255)])
		});
	}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.parent.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (user: User) => {
					this.authUser = user;

					this.profileForm.patchValue(this.authUser);
					this.profileForm.markAllAsTouched();
				},
				error: (error: any) => console.error(error)
			});

		this.profileForm$ = this.profileForm.valueChanges
			.pipe(startWith(this.profileForm.value))
			.subscribe({
				next: (value: any) => {
					// prettier-ignore
					this.profileFormIsPristine = Object.keys(value).every((key: string) => {
            return value[key] === this.authUser[key];
          });
				}
			});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.activatedRouteData$, this.profileForm$].forEach($ => $?.unsubscribe());
	}

	onToggleProfileFormAvatar(toggle: boolean): void {
		this.profileFormIsSubmitted = toggle;

		this.profileFormAvatarToggle = toggle;
	}

	onToggleQRCode(toggle: boolean): void {
		this.QRCodeToggle = toggle;

		if (!!toggle) {
			// prettier-ignore
			if (this.platformService.isBrowser()) {
				const window: Window = this.platformService.getWindow();

				this.QRCodeText = [window.location.origin, this.userService.getUserUrl(this.authUser)].join('');

				const QRElement: HTMLCanvasElement = this.QRCodeCanvas.nativeElement;
				const QRCallback = (error: Error): void => {
					if (!!error) {
						this.snackbarService.danger('Error', "Damn, can't draw your QR Code");
					} else {
						QRElement.removeAttribute('style');
					}
				};

				/** Draw QR Code */

				QRCode.toCanvas(QRElement, this.QRCodeText, this.QRCodeOptions, QRCallback);
			}
		}
	}

	onDownloadQRCode(): void {
		// prettier-ignore
		if (this.platformService.isBrowser()) {
			const QRCallback = (error: Error, dataURL: string): void => {
				if (!!error) {
					this.snackbarService.danger('Error', "Damn, can't download your QR Code");
				} else {
          this.helperService.getDownload(dataURL, this.userService.getUserUrl(this.authUser, 1));
				}
			};

			/** Download QR Code */

			QRCode.toDataURL(this.QRCodeText, this.QRCodeOptions, QRCallback);
		}
	}

	onSubmitCropper(fileCreateDto: FileCreateDto): void {
		this.onToggleProfileFormAvatar(false);

		const userUpdateDto: UserUpdateDto = {
			avatar: fileCreateDto.path
		};

		this.userService.update(this.authUser.id, userUpdateDto).subscribe({
			next: (user: User) => {
				this.authUser = {
					...user,
					settings: this.authUser.settings
				};

				this.authService.setUser(this.authUser);

				this.snackbarService.success('Success', 'Avatar has been updated');
			},
			error: (error: any) => console.error(error)
		});
	}

	onSubmitProfileForm(): void {
		if (this.helperService.getFormValidation(this.profileForm)) {
			this.profileFormIsSubmitted = true;

			const userUpdateDto: UserUpdateDto = {
				...this.profileForm.value
			};

			this.userService.update(this.authUser.id, userUpdateDto).subscribe({
				next: (user: User) => {
					this.profileFormIsPristine = true;

					this.authUser = {
						...user,
						settings: this.authUser.settings
					};

					this.authService.setUser(this.authUser);

					// prettier-ignore
					this.snackbarService.success('Success', 'Information has been updated');

					this.profileFormIsSubmitted = false;
				},
				error: () => (this.profileFormIsSubmitted = false)
			});
		}
	}
}
