/** @format */

import { Component, ElementRef, EventEmitter, inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { WindowComponent } from '../../window/window.component';
import { SnackbarService } from '../../../../core/services/snackbar.service';
import { InputTrimWhitespaceDirective } from '../../../directives/app-input-trim-whitespace.directive';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, Subscription, switchMap, throwError } from 'rxjs';
import { HelperService } from '../../../../core/services/helper.service';
import { CurrentUser } from '../../../../core/models/current-user.model';
import { AuthorizationService } from '../../../../core/services/authorization.service';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { PlatformService } from '../../../../core/services/platform.service';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { UserDeleteDto } from '../../../../core/dto/user/user-delete.dto';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserInfo } from 'firebase/auth';
import { InputShowPassword } from '../../../directives/app-input-show-password.directive';

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

	@ViewChild('userDeleteDialogElement') userDeleteDialogElement: ElementRef<HTMLDialogElement> | undefined;

	@Output() appUserDeleteSuccess: EventEmitter<User> = new EventEmitter<User>();
	@Output() appUserDeleteToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

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
		[this.currentUser$, this.userDeleteFormRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleUserDeleteDialog(toggle: boolean): void {
		this.userDeleteDialogToggle = toggle;

		if (toggle) {
			this.userDeleteForm.reset();
			this.userDeleteDialogElement.nativeElement.showModal();

			const abstractControlName: AbstractControl = this.userDeleteForm.get('name');

			abstractControlName.setValidators([
				Validators.required,
				Validators.pattern(this.helperService.getRegex('exact', this.currentUser.name))
			]);

			abstractControlName.updateValueAndValidity();

			// prettier-ignore
			const passwordProvider: UserInfo | undefined = this.currentUser.firebase.providerData.find((userInfo: UserInfo) => {
				return userInfo.providerId === 'password';
			});

			// Remove control if already exists
			this.userDeleteForm.removeControl('password');

			if (passwordProvider) {
				// prettier-ignore
				this.userDeleteForm.addControl('password', this.formBuilder.nonNullable.control('', [
					Validators.required,
					Validators.pattern(this.helperService.getRegex('password'))
				]));

				const abstractControlPassword: AbstractControl = this.userDeleteForm.get('password');

				abstractControlPassword.setValidators([
					Validators.required,
					Validators.minLength(6),
					Validators.maxLength(48),
					Validators.pattern(this.helperService.getRegex('password'))
				]);

				abstractControlName.updateValueAndValidity();
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

			this.userDeleteFormRequest$?.unsubscribe();
			this.userDeleteFormRequest$ = this.userService
				.delete(userId, userDeleteDto)
				.pipe(
					switchMap((user: User) => {
						return this.authorizationService.onSignOut().pipe(
							catchError((httpErrorResponse: HttpErrorResponse) => {
								this.router.navigate(['/error', httpErrorResponse.status]).then(() => console.debug('Route changed'));

								return throwError(() => httpErrorResponse);
							}),
							switchMap(() => of(user))
						);
					})
				)
				.subscribe({
					next: (user: User) => {
						this.appUserDeleteSuccess.emit(user);

						this.userDeleteForm.enable();

						this.onToggleUserDeleteDialog(false);

						this.router.navigateByUrl('/').then(() => {
							this.snackbarService.success('Chao', 'You will not be missed');
						});
					},
					error: () => this.userDeleteForm.enable()
				});
		}
	}
}
