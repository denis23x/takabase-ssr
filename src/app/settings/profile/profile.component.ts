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
	Validators
} from '@angular/forms';
import {
	AuthService,
	User,
	UserService,
	HelperService,
	SnackbarService,
	UserUpdateDto,
	FileCreateDto
} from '../../core';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Data } from '@angular/router';
import { Subscription } from 'rxjs';

interface ProfileForm {
	name: FormControl<string>;
	description: FormControl<string>;
}

@Component({
	selector: 'app-settings-profile',
	templateUrl: './profile.component.html'
})
export class SettingsProfileComponent implements OnInit, OnDestroy {
	@ViewChild('avatarInput') avatarInput: ElementRef | undefined;

	activatedRouteData$: Subscription | undefined;

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	profileForm: FormGroup | undefined;
	profileFormIsSubmitted: boolean = false;
	profileImage: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private authService: AuthService,
		private snackbarService: SnackbarService
	) {
		this.profileForm = this.formBuilder.group<ProfileForm>({
			name: this.formBuilder.control('', [
				Validators.required,
				Validators.minLength(4),
				Validators.maxLength(24)
			]),
			description: this.formBuilder.control('', [
				Validators.minLength(4),
				Validators.maxLength(255)
			])
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
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	onSubmitCropper(fileCreateDto: FileCreateDto): void {
		this.profileImage = false;

		const userUpdateDto: UserUpdateDto = {
			avatar: fileCreateDto?.path || null
		};

		this.userService.update(this.authUser.id, userUpdateDto).subscribe({
			next: (user: User) => {
				this.authUser = {
					...user,
					settings: this.authUser.settings
				};

				this.authService.setUser(this.authUser);

				this.snackbarService.success(null, 'Avatar updated');
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
					this.authUser = {
						...user,
						settings: this.authUser.settings
					};

					this.authService.setUser(this.authUser);

					this.snackbarService.success(null, 'Information updated');
				},
				error: (error: any) => console.error(error),
				complete: () => (this.profileFormIsSubmitted = false)
			});
		}
	}
}
