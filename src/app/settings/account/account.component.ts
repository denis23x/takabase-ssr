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
	FileService,
	FileGetOneDto,
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

	cropperFile: File | undefined;
	cropperModal: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private activatedRoute: ActivatedRoute,
		private userService: UserService,
		private authService: AuthService,
		private snackbarService: SnackbarService,
		private fileService: FileService
	) {
		this.avatarForm = this.formBuilder.group<AvatarForm>({
			url: this.formBuilder.control('', [
				this.helperService.getCustomValidator('url-image')
			])
		});

		this.accountForm = this.formBuilder.group<AccountForm>({
			name: this.formBuilder.control('', [Validators.required]),
			description: this.formBuilder.control('', [])
		});
	}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.parent.data
			.pipe(
				map((data: Data) => data.data),
				tap((user: User) => (this.user = user))
			)
			.subscribe({
				next: (user: User) => this.accountForm.patchValue(user),
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
	}

	onSubmitAvatarForm(): void {
		if (this.helperService.getFormValidation(this.avatarForm)) {
			this.avatarFormIsSubmitted = true;

			const fileGetOneDto: FileGetOneDto = {
				...this.avatarForm.value
			};

			this.fileService.getOne(fileGetOneDto).subscribe({
				next: (file: File) => {
					this.onShowCropper(undefined, file);

					this.avatarFormIsSubmitted = false;
				},
				error: () => (this.avatarFormIsSubmitted = false)
			});
		}
	}

	onUpdateAvatar(fileCreateDto?: FileCreateDto): void {
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

	onShowCropper(event?: Event, file?: File): void {
		const inputElement: HTMLInputElement = event
			? (event.target as HTMLInputElement)
			: undefined;

		this.cropperFile = inputElement ? inputElement.files.item(0) : file;
		this.cropperModal = true;

		this.avatarForm.reset();
	}

	onCloseCropper(): void {
		this.cropperFile = undefined;
		this.cropperModal = false;

		/** Rest avatarInput value */

		this.avatarInput.nativeElement.value = '';
	}

	onSubmitForm(): void {
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
}
