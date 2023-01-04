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
import { User, HelperService } from '../../core';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Data } from '@angular/router';
import { Subscription } from 'rxjs';

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

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	emailForm: FormGroup | undefined;
	emailFormIsSubmitted: boolean = false;

	passwordForm: FormGroup | undefined;
	passwordFormIsSubmitted: boolean = false;

	constructor(
		private formBuilder: FormBuilder,
		private helperService: HelperService,
		private activatedRoute: ActivatedRoute
	) {
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
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (user: User) => {
					this.authUser = user;

					this.emailForm.patchValue(user);
					this.emailForm.markAllAsTouched();
				},
				error: (error: any) => console.error(error)
			});
	}

	ngOnDestroy(): void {
		[this.activatedRouteData$].forEach($ => $?.unsubscribe());
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
