/** @format */

import { Component, ElementRef, EventEmitter, inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { UserService } from '../../../../core/services/user.service';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { PasswordService } from '../../../../core/services/password.service';
import { CurrentUserMixin as CU } from '../../../../core/mixins/current-user.mixin';
import type { PasswordValidateGetDto } from '../../../../core/dto/password/password-validate-get.dto';
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
		BadgeErrorComponent
	],
	providers: [PasswordService, UserService],
	selector: 'app-user-delete, [appUserDelete]',
	templateUrl: './delete.component.html'
})
export class UserDeleteComponent extends CU(class {}) implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly userService: UserService = inject(UserService);
	private readonly router: Router = inject(Router);
	private readonly passwordService: PasswordService = inject(PasswordService);

	@ViewChild('userDeleteDialogElement') userDeleteDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appUserDeleteSuccess: EventEmitter<void> = new EventEmitter<void>();
	@Output() appUserDeleteToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	userDeleteForm: FormGroup = this.formBuilder.group<UserDeleteForm>({
		name: this.formBuilder.nonNullable.control('', [])
	});
	userDeleteFormRequest$: Subscription | undefined;
	userDeleteDialogToggle: boolean = false;
	userDeleteSignOutRequest$: Subscription | undefined;

	ngOnInit(): void {
		super.ngOnInit();
	}

	ngOnDestroy(): void {
		super.ngOnDestroy();

		// ngOnDestroy

		[this.userDeleteSignOutRequest$, this.userDeleteFormRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleUserDeleteDialog(toggle: boolean): void {
		this.userDeleteDialogToggle = toggle;

		// prettier-ignore
		if (toggle) {
			this.userDeleteForm.reset();
			this.userDeleteDialogElement.nativeElement.showModal();

			const abstractControlName: AbstractControl = this.userDeleteForm.get('name');
			const abstractControlValidator: (...args: any) => ValidatorFn = this.helperService.getCustomValidator('match');

			abstractControlName.setValidators([Validators.required, abstractControlValidator(this.currentUser.displayName)]);
			abstractControlName.updateValueAndValidity();

			const passwordProvider: UserInfo | undefined = this.currentUser.providerData.find((userInfo: UserInfo) => {
				return userInfo.providerId === 'password';
			});

			/** Remove control if already exists */

			this.userDeleteForm.removeControl('password');

			if (passwordProvider) {
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

			const userUid: string = this.currentUser.uid;
			const userDeleteDto: UserDeleteDto = {};

			// Attach password only if provided

			if (this.userDeleteForm.value.password) {
				userDeleteDto.password = this.userDeleteForm.value.password;
			}

			const userDeleteRequest$: Observable<User> = this.userService.delete(userUid, userDeleteDto).pipe(
				catchError((httpErrorResponse: HttpErrorResponse) => {
					this.userDeleteSignOutRequest$?.unsubscribe();
					this.userDeleteSignOutRequest$ = this.authorizationService.getSignOut().subscribe({
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
				.pipe(switchMap(() => this.authorizationService.getSignOut()))
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
