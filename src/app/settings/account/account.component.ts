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
import { map, tap } from 'rxjs/operators';
import { ActivatedRoute, Data } from '@angular/router';
import { Subscription } from 'rxjs';

interface AvatarForm {
	url: FormControl<string>;
}

interface AccountForm {
	name: FormControl<string>;
	description: FormControl<string>;
}

interface EmailForm {
	email: FormControl<string>;
}

interface PasswordForm {
	passwordOld: FormControl<string>;
	passwordNew: FormControl<string>;
}

@Component({
	selector: 'app-settings-account',
	templateUrl: './account.component.html'
})
export class SettingsAccountComponent implements OnInit, OnDestroy {
	@ViewChild('avatarInput') avatarInput: ElementRef | undefined;

	activatedRouteData$: Subscription | undefined;

	user: User | undefined;

	avatarForm: FormGroup | undefined;
	avatarFormIsSubmitted: boolean = false;

	accountForm: FormGroup | undefined;
	accountFormIsSubmitted: boolean = false;

	emailForm: FormGroup | undefined;
	emailFormIsSubmitted: boolean = false;

	passwordForm: FormGroup | undefined;
	passwordFormIsSubmitted: boolean = false;

	postImage: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private authService: AuthService,
		private snackbarService: SnackbarService
	) {
		this.avatarForm = this.formBuilder.group<AvatarForm>({
			url: this.formBuilder.control('', [
				this.helperService.getCustomValidator('url-image')
			])
		});

		this.accountForm = this.formBuilder.group<AccountForm>({
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

		this.emailForm = this.formBuilder.group<EmailForm>({
			email: this.formBuilder.control('', [
				Validators.required,
				Validators.email
			])
		});

		this.passwordForm = this.formBuilder.group<PasswordForm>({
			passwordOld: this.formBuilder.control('', [
				Validators.required,
				Validators.pattern(this.helperService.getRegex('password'))
			]),
			passwordNew: this.formBuilder.control('', [
				Validators.required,
				Validators.pattern(this.helperService.getRegex('password'))
			])
		});
	}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.parent.data
			.pipe(
				map((data: Data) => data.data),
				tap((user: User) => (this.user = user))
			)
			.subscribe({
				next: (user: User) => {
					this.accountForm.patchValue(user);
					this.emailForm.patchValue(user);
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	onSubmitCropper(fileCreateDto?: FileCreateDto): void {
		const userUpdateDto: UserUpdateDto = {
			avatar: fileCreateDto?.path || null
		};

		this.userService.update(this.user.id, userUpdateDto).subscribe({
			next: (user: User) => {
				this.user = user;

				this.authService.setUser(user);

				// prettier-ignore
				this.snackbarService.success(null, !!fileCreateDto ? 'Avatar updated' : 'Avatar deleted');
			},
			error: (error: any) => console.error(error)
		});
	}

	onSubmitAccountForm(): void {
		if (this.helperService.getFormValidation(this.accountForm)) {
			this.accountFormIsSubmitted = true;

			const userUpdateDto: UserUpdateDto = {
				...this.accountForm.value
			};

			this.userService.update(this.user.id, userUpdateDto).subscribe({
				next: (user: User) => {
					this.user = user;

					this.authService.setUser(user);

					this.snackbarService.success(null, 'Information updated');

					this.accountFormIsSubmitted = false;
				},
				error: () => (this.accountFormIsSubmitted = false)
			});
		}
	}

	onSubmitEmailForm(): void {
		if (this.helperService.getFormValidation(this.emailForm)) {
			this.emailFormIsSubmitted = true;
		}
	}

	onSubmitPasswordForm(): void {
		if (this.helperService.getFormValidation(this.passwordForm)) {
			this.passwordFormIsSubmitted = true;
		}
	}
}
