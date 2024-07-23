/** @format */

import { Component, ElementRef, EventEmitter, inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { InputTrimWhitespaceDirective } from '../../../directives/app-input-trim-whitespace.directive';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	ValidatorFn,
	Validators
} from '@angular/forms';
import { Observable, Subscription, switchMap, throwError } from 'rxjs';
import { HelperService } from '../../../../core/services/helper.service';
import { AuthorizationService } from '../../../../core/services/authorization.service';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { PlatformService } from '../../../../core/services/platform.service';
import { UserService } from '../../../../core/services/user.service';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { InputShowPassword } from '../../../directives/app-input-show-password.directive';
import { PasswordService } from '../../../../core/services/password.service';
import type { PasswordValidateGetDto } from '../../../../core/dto/password/password-validate-get.dto';
import type { CurrentUser } from '../../../../core/models/current-user.model';
import type { User } from '../../../../core/models/user.model';
import type { UserInfo } from 'firebase/auth';
import type { UserDeleteDto } from '../../../../core/dto/user/user-delete.dto';
import type { HttpErrorResponse } from '@angular/common/http';

interface UserDeleteForm {
	name: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		SvgIconComponent,
		WindowComponent,
		InputTrimWhitespaceDirective,
		ReactiveFormsModule,
		BadgeErrorComponent,
		InputShowPassword
	],
	providers: [PasswordService, UserService],
	selector: 'app-user-delete, [appUserDelete]',
	templateUrl: './delete.component.html'
})
export class UserDeleteComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly location: Location = inject(Location);
	private readonly userService: UserService = inject(UserService);
	private readonly router: Router = inject(Router);
	private readonly passwordService: PasswordService = inject(PasswordService);

	@ViewChild('userDeleteDialogElement') userDeleteDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appUserDeleteSuccess: EventEmitter<void> = new EventEmitter<void>();
	@Output() appUserDeleteToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;
	currentUserSignOutRequest$: Subscription | undefined;

	userDeleteForm: FormGroup = this.formBuilder.group<UserDeleteForm>({
		name: this.formBuilder.nonNullable.control('', [])
	});
	userDeleteFormRequest$: Subscription | undefined;
	userDeleteDialogToggle: boolean = false;

	ngOnInit(): void {
		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService.getCurrentUser().subscribe({
			next: (currentUser: CurrentUser | undefined) => (this.currentUser = currentUser),
			error: (error: any) => console.error(error)
		});

		/** Extra toggle close when url change */

		if (this.platformService.isBrowser()) {
			this.location.onUrlChange(() => this.onToggleUserDeleteDialog(false));
		}
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.currentUser$, this.currentUserSignOutRequest$, this.userDeleteFormRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleUserDeleteDialog(toggle: boolean): void {
		this.userDeleteDialogToggle = toggle;

		if (toggle) {
			this.userDeleteForm.reset();
			this.userDeleteDialogElement.nativeElement.showModal();

			const abstractControlName: AbstractControl = this.userDeleteForm.get('name');
			const abstractControlValidator: (...args: any) => ValidatorFn = this.helperService.getCustomValidator('match');

			abstractControlName.setValidators([Validators.required, abstractControlValidator(this.currentUser.name)]);
			abstractControlName.updateValueAndValidity();

			// prettier-ignore
			const passwordProvider: UserInfo | undefined = this.currentUser.firebase.providerData.find((userInfo: UserInfo) => {
				return userInfo.providerId === 'password';
			});

			if (passwordProvider) {
				// Remove control if already exists
				this.userDeleteForm.removeControl('password');

				// prettier-ignore
				this.userDeleteForm.addControl('password', this.formBuilder.nonNullable.control('', [
					Validators.required,
					Validators.minLength(6),
					Validators.maxLength(48),
					Validators.pattern(this.helperService.getRegex('password'))
				]));
			}
		} else {
			this.userDeleteForm.reset();
			this.userDeleteDialogElement.nativeElement.close();
		}

		this.appUserDeleteToggle.emit(toggle);
	}

	onSubmitUserDeleteForm(): void {
		if (this.helperService.getFormValidation(this.userDeleteForm)) {
			this.userDeleteForm.disable();

			const userId: number = this.currentUser.id;
			const userDeleteDto: UserDeleteDto = {
				...this.userDeleteForm.value
			};

			const userDeleteRequest$: Observable<User> = this.userService.delete(userId, userDeleteDto).pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					this.currentUserSignOutRequest$?.unsubscribe();
					this.currentUserSignOutRequest$ = this.authorizationService.onSignOut().subscribe({
						next: () => {
							this.router.navigateByUrl('/').then(() => {
								this.snackbarService.warning(null, 'Something goes wrong');
							});
						},
						error: (error: any) => console.error(error)
					});

					return throwError(() => httpErrorResponse);
				})
			);

			const userDeleteFormRequest$ = (): Observable<User> => {
				if (userDeleteDto.password) {
					const passwordValidateGetDto: PasswordValidateGetDto = {
						...this.userDeleteForm.value
					};

					return this.passwordService.onValidate(passwordValidateGetDto).pipe(switchMap(() => userDeleteRequest$));
				}

				return userDeleteRequest$;
			};

			/** Request */

			this.userDeleteFormRequest$?.unsubscribe();
			this.userDeleteFormRequest$ = userDeleteFormRequest$()
				.pipe(switchMap(() => this.authorizationService.onSignOut()))
				.subscribe({
					next: () => {
						this.appUserDeleteSuccess.emit();

						this.userDeleteForm.enable();

						this.onToggleUserDeleteDialog(false);

						this.router.navigateByUrl('/').then(() => {
							this.snackbarService.success('Ciao', 'You will not be missed <3');
						});
					},
					error: () => this.userDeleteForm.enable()
				});
		}
	}
}
