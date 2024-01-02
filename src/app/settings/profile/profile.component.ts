/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { AppInputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { DayjsPipe } from '../../standalone/pipes/dayjs.pipe';
import { UserUrlPipe } from '../../standalone/pipes/user-url.pipe';
import { HelperService } from '../../core/services/helper.service';
import { UserService } from '../../core/services/user.service';
import { AuthorizationService } from '../../core/services/authorization.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { UserUpdateDto } from '../../core/dto/user/user-update.dto';
import { AppTextareaAutosizeDirective } from '../../standalone/directives/app-textarea-autosize.directive';
import { CurrentUser } from '../../core/models/current-user.model';
import { User } from '../../core/models/user.model';
import { QrCodeComponent } from '../../standalone/components/qr-code/qr-code.component';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { AppSkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { PlatformService } from '../../core/services/platform.service';
import { SkeletonService } from '../../core/services/skeleton.service';
import { FileService } from '../../core/services/file.service';

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
		DayjsPipe,
		UserUrlPipe,
		AppInputTrimWhitespaceDirective,
		AppTextareaAutosizeDirective,
		QrCodeComponent,
		DropdownComponent,
		AppSkeletonDirective
	],
	selector: 'app-settings-profile',
	templateUrl: './profile.component.html'
})
export class SettingsProfileComponent implements OnInit, OnDestroy {
	currentUser: CurrentUser | undefined;
	currentUserSkeletonToggle: boolean = true;
	currentUser$: Subscription | undefined;
	currentUserRequest$: Subscription | undefined;

	profileForm: FormGroup | undefined;
	profileFormIsPristine: boolean = false;
	profileFormIsPristine$: Subscription | undefined;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private userService: UserService,
		private authorizationService: AuthorizationService,
		private snackbarService: SnackbarService,
		private skeletonService: SkeletonService,
		private platformService: PlatformService,
		private fileService: FileService
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

		this.setSkeleton();
		this.setResolver();
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.currentUser$, this.currentUserRequest$, this.profileFormIsPristine$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.currentUser = this.skeletonService.getUser() as CurrentUser;
		this.currentUserSkeletonToggle = true;
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			this.currentUser$?.unsubscribe();
			this.currentUser$ = this.authorizationService
				.getCurrentUser()
				.pipe(
					tap((currentUser: CurrentUser) => {
						this.currentUser = currentUser;
						this.currentUserSkeletonToggle = false;
					})
				)
				.subscribe({
					next: () => {
						this.profileForm.patchValue(this.currentUser);
						this.profileForm.markAllAsTouched();

						this.profileFormIsPristine$?.unsubscribe();
						this.profileFormIsPristine$ = this.profileForm.valueChanges
							.pipe(startWith(this.profileForm.value))
							.subscribe({
								next: (value: any) => {
									this.profileFormIsPristine = Object.keys(value).every((key: string) => {
										// @ts-ignore
										return value[key] === this.currentUser[key];
									});
								},
								error: (error: any) => console.error(error)
							});
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	onDeleteAvatar(avatar: string): void {
		this.profileForm.disable();

		const userUpdateDto: UserUpdateDto = {
			avatar: null
		};

		this.currentUserRequest$?.unsubscribe();
		this.currentUserRequest$ = this.userService
			.update(this.currentUser.id, userUpdateDto)
			.pipe(switchMap((user: User) => this.authorizationService.setCurrentUser(user)))
			.subscribe({
				next: () => {
					this.fileService.delete(avatar).subscribe({
						next: () => console.debug('File removed'),
						error: (error: any) => console.error(error)
					});

					this.snackbarService.success('Okay', 'Avatar has been removed');

					this.profileForm.enable();
				},
				error: () => this.profileForm.enable()
			});
	}

	onToggleCropper(toggle: boolean): void {
		if (toggle) {
			this.profileForm.disable();
		} else {
			this.profileForm.enable();
		}
	}

	onSubmitCropper(file: File): void {
		this.profileForm.disable();

		// TODO: update

		const currentUserAvatar: string | null = this.currentUser.avatar;

		this.fileService.create(file, '/upload/user-avatars').subscribe({
			next: (fileUrl: string) => {
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

							/** Silent deleting */

							if (currentUserAvatar) {
								this.fileService.delete(currentUserAvatar).subscribe({
									next: () => console.debug('File removed'),
									error: (error: any) => console.error(error)
								});
							}

							/** Enable */

							this.profileForm.enable();
						},
						error: () => this.profileForm.enable()
					});
			},
			error: () => this.profileForm.enable()
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
