/** @format */

import {
	Component,
	ComponentRef,
	inject,
	OnDestroy,
	OnInit,
	signal,
	ViewContainerRef,
	WritableSignal
} from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	ValidatorFn,
	Validators
} from '@angular/forms';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { UserAvatarComponent } from '../../standalone/components/user/avatar/avatar.component';
import { InputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { HelperService } from '../../core/services/helper.service';
import { UserService } from '../../core/services/user.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { TextareaAutosizeDirective } from '../../standalone/directives/app-textarea-autosize.directive';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { PlatformService } from '../../core/services/platform.service';
import { BadgeErrorComponent } from '../../standalone/components/badge-error/badge-error.component';
import { AIService } from '../../core/services/ai.service';
import { FirebaseService } from '../../core/services/firebase.service';
import { getValue, Value } from 'firebase/remote-config';
import { SharpService } from '../../core/services/sharp.service';
import { CurrentUserMixin as CU } from '../../core/mixins/current-user.mixin';
import type { User } from '../../core/models/user.model';
import type { UserUpdateDto } from '../../core/dto/user/user-update.dto';
import type { CropperComponent } from '../../standalone/components/cropper/cropper.component';
import type { AIModerateTextDto } from '../../core/dto/ai/ai-moderate-text.dto';

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
		UserAvatarComponent,
		InputTrimWhitespaceDirective,
		TextareaAutosizeDirective,
		DropdownComponent,
		SkeletonDirective,
		BadgeErrorComponent
	],
	providers: [AIService, UserService, SharpService],
	selector: 'app-settings-profile',
	templateUrl: './profile.component.html'
})
export class SettingsProfileComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly userService: UserService = inject(UserService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly sharpService: SharpService = inject(SharpService);
	private readonly aiService: AIService = inject(AIService);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);
	private readonly viewContainerRef: ViewContainerRef = inject(ViewContainerRef);

	profileFormUser: User | undefined;
	profileFormUserSkeletonToggle: boolean = true;

	profileFormGetRequest$: Subscription | undefined;
	profileFormUpdateRequest$: Subscription | undefined;

	profileForm: FormGroup = this.formBuilder.group<ProfileForm>({
		avatar: this.formBuilder.control(null, []),
		name: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(4),
			Validators.maxLength(32),
			Validators.pattern(this.helperService.getRegex('username')),
			Validators.pattern(this.helperService.getRegex('no-whitespace'))
		]),
		description: this.formBuilder.control(null, [Validators.minLength(16), Validators.maxLength(192)])
	});
	profileFormStage: string = 'Submit';
	profileFormIsPristine: boolean = false;
	profileFormIsPristine$: Subscription | undefined;
	profileFormAvatarRequest$: Subscription | undefined;
	profileFormAvatarIsSubmitted: WritableSignal<boolean> = signal(false);

	// Lazy loading

	appCropperComponent: ComponentRef<CropperComponent>;

	ngOnInit(): void {
		super.ngOnInit();

		/** Apply Data */

		this.setResolver();

		/** Set not allowed values */

		this.onUpdateProfileForm();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// ngOnDestroy
		// prettier-ignore
		[this.profileFormGetRequest$, this.profileFormUpdateRequest$, this.profileFormIsPristine$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			this.profileFormGetRequest$?.unsubscribe();
			this.profileFormGetRequest$ = this.userService.getOne(this.currentUser.uid).subscribe({
				next: (user: User) => {
					this.profileFormUser = user;
					this.profileFormUserSkeletonToggle = false;

					this.profileForm.patchValue(user);
					this.profileForm.markAllAsTouched();

					this.profileFormIsPristine$?.unsubscribe();
					this.profileFormIsPristine$ = this.profileForm.valueChanges
						.pipe(startWith(this.profileForm.value))
						.subscribe({
							next: (value: any) => {
								this.profileFormIsPristine = Object.keys(value).every((key: string) => {
									return (value[key] || null) === this.profileFormUser[key as keyof User];
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
		this.profileFormAvatarIsSubmitted.set(false);
	}

	onSubmitCropperAvatar(file: File): void {
		this.profileForm.get('avatar').setValue(null, { emitEvent: false });
		this.profileFormAvatarIsSubmitted.set(true);

		/** Request */

		this.profileFormAvatarRequest$?.unsubscribe();
		this.profileFormAvatarRequest$ = this.sharpService
			.create(file)
			.pipe(map((fileUrl: string) => this.sharpService.getFileUrlClean(fileUrl)))
			.subscribe({
				next: (fileUrl: string) => this.onUpdateCropperAvatar(fileUrl),
				error: () => this.profileFormAvatarIsSubmitted.set(false)
			});
	}

	/** profileForm */

	onUpdateProfileForm(): void {
		if (this.platformService.isBrowser()) {
			const value: Value = getValue(this.firebaseService.getRemoteConfig(), 'forbiddenUsername');
			const valueForbiddenUsername: string[] = JSON.parse(value.asString());

			const abstractControl: AbstractControl = this.profileForm.get('name');
			const abstractControlValidator: (...args: any) => ValidatorFn = this.helperService.getCustomValidator('not');

			abstractControl.addValidators([abstractControlValidator(valueForbiddenUsername)]);
			abstractControl.updateValueAndValidity();
		}
	}

	onSubmitProfileForm(): void {
		if (this.helperService.getFormValidation(this.profileForm)) {
			this.profileForm.disable();
			this.profileFormStage = 'Moderation';

			const userUpdateDto: UserUpdateDto = {
				...this.profileForm.value,
				avatar: this.profileForm.value.avatar || null,
				description: this.profileForm.value.description || null
			};

			const aiModerateTextDto: AIModerateTextDto = {
				model: 'text-moderation-stable',
				input: this.aiService.setInput(userUpdateDto)
			};

			/** Moderate and update */

			this.profileFormUpdateRequest$?.unsubscribe();
			this.profileFormUpdateRequest$ = this.aiService
				.moderateText(aiModerateTextDto)
				.pipe(
					tap(() => (this.profileFormStage = 'Saving')),
					switchMap(() => this.userService.update(this.currentUser.uid, userUpdateDto))
				)
				.subscribe({
					next: (user: User) => {
						this.authorizationService.setCurrentUser({
							displayName: user.name,
							photoURL: user.avatar
						});

						this.snackbarService.success('Success', 'Information has been updated');

						this.profileFormUser = user;
						this.profileFormIsPristine = true;
						this.profileForm.enable();
						this.profileForm.patchValue(user);
					},
					error: () => {
						this.profileForm.enable();
						this.profileFormStage = 'Moderation';
					}
				});
		}
	}

	/** LAZY */

	async onToggleCropperDialog(): Promise<void> {
		if (!this.appCropperComponent) {
			await import('../../standalone/components/cropper/cropper.component').then(m => {
				this.appCropperComponent = this.viewContainerRef.createComponent(m.CropperComponent);
				this.appCropperComponent.instance.appCropperSubmit.subscribe({
					next: (file: File) => this.onSubmitCropperAvatar(file),
					error: (error: any) => console.error(error)
				});
			});
		}

		this.appCropperComponent.changeDetectorRef.detectChanges();
		this.appCropperComponent.instance.onToggleCropperDialog(true);
	}
}
