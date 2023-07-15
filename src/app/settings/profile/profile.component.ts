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
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { CropperComponent } from '../../standalone/components/cropper/cropper.component';
import { WindowComponent } from '../../standalone/components/window/window.component';
import { AppInputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { DayjsPipe } from '../../standalone/pipes/dayjs.pipe';
import { UserUrlPipe } from '../../standalone/pipes/user-url.pipe';
import { User } from '../../core/models/user.model';
import { HelperService } from '../../core/services/helper.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { FileCreateDto } from '../../core/dto/file/file-create.dto';
import { UserUpdateDto } from '../../core/dto/user/user-update.dto';
import { PlatformService } from '../../core/services/platform.service';
import { UiService } from '../../core/services/ui.service';
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
		AvatarComponent,
		CropperComponent,
		WindowComponent,
		DayjsPipe,
		UserUrlPipe,
		AppInputTrimWhitespaceDirective
	],
	selector: 'app-settings-profile',
	templateUrl: './profile.component.html'
})
export class SettingsProfileComponent implements OnInit, OnDestroy {
	// prettier-ignore
	@ViewChild('profileFormAvatarModal') profileFormAvatarModal: ElementRef<HTMLDialogElement> | undefined;

	// prettier-ignore
	@ViewChild('QRCodeCanvas') QRCodeCanvas: ElementRef<HTMLCanvasElement> | undefined;

	// prettier-ignore
	@ViewChild('QRCodeModal') QRCodeModal: ElementRef<HTMLDialogElement> | undefined;

	activatedRouteData$: Subscription | undefined;

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	profileForm: FormGroup | undefined;
	profileForm$: Subscription | undefined;
	profileFormIsPristine: boolean = false;

	QRCodeText: string | undefined;
	QRCodeOptions: QRCodeRenderersOptions = {
		margin: 2,
		scale: 1,
		width: 384,
		color: {
			dark: '#000000ff',
			light: '#ffffffff'
		}
	};

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private authService: AuthService,
		private snackbarService: SnackbarService,
		private platformService: PlatformService,
		private uiService: UiService
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
		if (toggle) {
			this.profileForm.disable();
			this.profileFormAvatarModal.nativeElement.showModal();
		} else {
			this.profileForm.enable();
			this.profileFormAvatarModal.nativeElement.close();
		}
	}

	onToggleQRCode(toggle: boolean): void {
		if (toggle) {
			this.QRCodeModal.nativeElement.showModal();

			if (this.platformService.isBrowser()) {
				const window: Window = this.platformService.getWindow();

				/** Prepare theme colors */

				const variablesCSSMap: any[] = [
					{
						nameHSL: '--bc',
						nameHEX: 'dark'
					},
					{
						nameHSL: '--b1',
						nameHEX: 'light'
					}
				];

				// prettier-ignore
				variablesCSSMap.forEach((variable: any) => {
          const value: string = this.uiService.getCSSPropertyValue(variable.nameHSL);

          const [h, s, l]: number[] = value.split(/\s/g).map((value: string) => Number(value.replace('%', '')));
          const valueList: string[] = this.uiService.getHSLToHEX(h, s, l);

          const propertyValue: string = [...valueList, 'ff'].join('');
          const property: string = variable.nameHEX;

          this.QRCodeOptions.color[property] = propertyValue;
        });

				/** Draw QR Code */

				// prettier-ignore
				this.QRCodeText = [window.location.origin, this.userService.getUserUrl(this.authUser)].join('');

				// prettier-ignore
				QRCode.toCanvas(this.QRCodeCanvas.nativeElement, this.QRCodeText, this.QRCodeOptions, (error: Error): void => {
          if (error) {
            this.snackbarService.danger('Error', "Can't draw your QR Code");
          } else {
            this.QRCodeCanvas.nativeElement.removeAttribute('style');
          }
        });
			}
		} else {
			this.QRCodeModal.nativeElement.close();
		}
	}

	onDownloadQRCode(): void {
		// prettier-ignore
		if (this.platformService.isBrowser()) {
			QRCode.toDataURL(this.QRCodeText, this.QRCodeOptions, (error: Error, dataURL: string): void => {
        if (error) {
          this.snackbarService.danger('Error', "Can't download your QR Code");
        } else {
          this.helperService.getDownload(dataURL, this.userService.getUserUrl(this.authUser, 1));
        }
      });
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
			this.profileForm.disable();

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

					this.profileForm.enable();
				},
				error: () => this.profileForm.enable()
			});
		}
	}
}
