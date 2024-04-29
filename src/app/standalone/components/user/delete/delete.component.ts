/** @format */

import {
	Component,
	ElementRef,
	EventEmitter,
	inject,
	OnDestroy,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
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
	Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { HelperService } from '../../../../core/services/helper.service';
import { CurrentUser } from '../../../../core/models/current-user.model';
import { AuthorizationService } from '../../../../core/services/authorization.service';
import { BadgeErrorComponent } from '../../badge-error/badge-error.component';
import { PlatformService } from '../../../../core/services/platform.service';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { UserDeleteDto } from '../../../../core/dto/user/user-delete.dto';

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

	// prettier-ignore
	@ViewChild('userDeleteDialogElement') userDeleteDialogElement: ElementRef<HTMLDialogElement> | undefined;

	// prettier-ignore
	@Output() appUserDeleteSuccess: EventEmitter<User> = new EventEmitter<User>();
	@Output() appUserDeleteToggle: EventEmitter<boolean> = new EventEmitter<boolean>();

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	userDeleteDialogToggle: boolean = false;
	userDeleteFormPassword: string | undefined;
	userDeleteForm: FormGroup = this.formBuilder.group<UserDeleteForm>({
		name: this.formBuilder.nonNullable.control('', [])
	});
	userDeleteFormRequest$: Subscription | undefined;

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
		[this.currentUser$, this.userDeleteFormRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	onToggleUserDeleteDialog(toggle: boolean): void {
		this.userDeleteDialogToggle = toggle;

		if (toggle) {
			this.userDeleteForm.reset();
			this.userDeleteDialogElement.nativeElement.showModal();

			const abstractControl: AbstractControl = this.userDeleteForm.get('name');

			abstractControl.setValidators([
				Validators.required,
				Validators.pattern(this.helperService.getRegex('exact', this.currentUser.name))
			]);

			abstractControl.updateValueAndValidity();
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
				password: this.userDeleteFormPassword
			};

			this.userDeleteFormRequest$?.unsubscribe();
			this.userDeleteFormRequest$ = this.userService.delete(userId, userDeleteDto).subscribe({
				next: (user: User) => {
					this.snackbarService.success('Chao', 'We will not miss you');

					this.appUserDeleteSuccess.emit(user);

					this.userDeleteForm.enable();

					this.onToggleUserDeleteDialog(false);
				},
				error: () => this.userDeleteForm.enable()
			});
		}
	}
}
