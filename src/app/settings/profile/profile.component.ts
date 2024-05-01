/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { CropperComponent } from '../../standalone/components/cropper/cropper.component';
import { InputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { DayjsPipe } from '../../standalone/pipes/dayjs.pipe';
import { UserUrlPipe } from '../../standalone/pipes/user-url.pipe';
import { HelperService } from '../../core/services/helper.service';
import { UserService } from '../../core/services/user.service';
import { AuthorizationService } from '../../core/services/authorization.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { UserUpdateDto } from '../../core/dto/user/user-update.dto';
import { TextareaAutosizeDirective } from '../../standalone/directives/app-textarea-autosize.directive';
import { CurrentUser } from '../../core/models/current-user.model';
import { User } from '../../core/models/user.model';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { PlatformService } from '../../core/services/platform.service';
import { SkeletonService } from '../../core/services/skeleton.service';
import { FileService } from '../../core/services/file.service';
import { BadgeErrorComponent } from '../../standalone/components/badge-error/badge-error.component';
import { AIModerateTextDto } from '../../core/dto/ai/ai-moderate-text.dto';
import { AIService } from '../../core/services/ai.service';

interface ProfileForm {
	avatar: FormControl<string | null>;
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
		InputTrimWhitespaceDirective,
		TextareaAutosizeDirective,
		DropdownComponent,
		SkeletonDirective,
		BadgeErrorComponent
	],
	selector: 'app-settings-profile',
	templateUrl: './profile.component.html'
})
export class SettingsProfileComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly userService: UserService = inject(UserService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly skeletonService: SkeletonService = inject(SkeletonService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly fileService: FileService = inject(FileService);
	private readonly aiService: AIService = inject(AIService);

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;
	currentUserSkeletonToggle: boolean = true;
	currentUserRequest$: Subscription | undefined;

	profileForm: FormGroup = this.formBuilder.group<ProfileForm>({
		avatar: this.formBuilder.control(null, []),
		name: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(4),
			Validators.maxLength(24),
			Validators.pattern(this.helperService.getRegex('no-whitespace'))
		]),
		description: this.formBuilder.control(null, [Validators.maxLength(255)])
	});
	profileFormIsPristine: boolean = false;
	profileFormIsPristine$: Subscription | undefined;

	profileFormAvatarSkeletonToggle: boolean = false;
	profileFormAvatarRequest$: Subscription | undefined;

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
					filter((currentUser: CurrentUser | undefined) => !!currentUser),
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

	/** Avatar Cropper */

	onUpdateCropperAvatar(fileUrl: string | null): void {
		this.profileForm.get('avatar').setValue(fileUrl, { emitEvent: true });
		this.profileFormAvatarSkeletonToggle = false;

		/** Update current user */

		this.currentUser = {
			...this.currentUser,
			...this.profileForm.value
		};
	}

	onSubmitCropperAvatar(file: File): void {
		this.profileForm.get('avatar').setValue(null, { emitEvent: false });
		this.profileFormAvatarSkeletonToggle = true;

		/** Update current user */

		this.currentUser = {
			...this.currentUser,
			...this.profileForm.value
		};

		/** Request */

		this.profileFormAvatarRequest$?.unsubscribe();
		this.profileFormAvatarRequest$ = this.fileService
			.create(file)
			.pipe(map((fileUrl: string) => this.fileService.getFileUrlClean(fileUrl)))
			.subscribe({
				next: (fileUrl: string) => this.onUpdateCropperAvatar(fileUrl),
				error: () => (this.profileFormAvatarSkeletonToggle = false)
			});
	}

	/** profileForm */

	onToggleProfileFormStatus(toggle: boolean): void {
		if (toggle) {
			this.profileForm.disable();
		} else {
			this.profileForm.enable();
		}
	}

	onSubmitProfileForm(): void {
		if (this.helperService.getFormValidation(this.profileForm)) {
			this.profileForm.disable();

			const userUpdateDto: UserUpdateDto = {
				...this.profileForm.value
			};

			const aiModerateTextDto: AIModerateTextDto = {
				model: 'text-moderation-stable',
				input: this.aiService.setInput(userUpdateDto)
			};

			/** Moderate and update */

			this.currentUserRequest$?.unsubscribe();
			this.currentUserRequest$ = this.aiService
				.moderateText(aiModerateTextDto)
				.pipe(
					switchMap(() => this.userService.update(this.currentUser.id, userUpdateDto)),
					switchMap((user: User) => this.authorizationService.setCurrentUser(user))
				)
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
