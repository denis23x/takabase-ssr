/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	ValidatorFn,
	Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { AuthorizationService } from '../../core/services/authorization.service';
import { UserService } from '../../core/services/user.service';
import { HelperService } from '../../core/services/helper.service';
import { MetaService } from '../../core/services/meta.service';
import { InputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../core/services/snackbar.service';
import { SignInComponent } from '../../standalone/components/sign-in/sign-in.component';
import { from, Subscription, switchMap } from 'rxjs';
import { BadgeErrorComponent } from '../../standalone/components/badge-error/badge-error.component';
import { CommonModule } from '@angular/common';
import { AIService } from '../../core/services/ai.service';
import { UserAvatarComponent } from '../../standalone/components/user/avatar/avatar.component';
import { FirebaseService } from '../../core/services/firebase.service';
import { PlatformService } from '../../core/services/platform.service';
import { getValue, Value } from 'firebase/remote-config';
import { catchError, tap } from 'rxjs/operators';
import { createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { ApiService } from '../../core/services/api.service';
import type { UserGetAllDto } from '../../core/dto/user/user-get-all.dto';
import type { User } from '../../core/models/user.model';
import type { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import type { UserCreateDto } from '../../core/dto/user/user-create.dto';
import type { FirebaseError } from 'firebase/app';
import type { CurrentUser } from '../../core/models/current-user.model';

interface RegistrationForm {
	name: FormControl<string>;
	email: FormControl<string>;
	password: FormControl<string>;
	terms: FormControl<boolean>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		SvgIconComponent,
		InputTrimWhitespaceDirective,
		SignInComponent,
		BadgeErrorComponent,
		UserAvatarComponent
	],
	providers: [AIService, UserService],
	selector: 'app-authorization-registration',
	templateUrl: './registration.component.html'
})
export class AuthRegistrationComponent implements OnInit, OnDestroy {
	private readonly router: Router = inject(Router);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly userService: UserService = inject(UserService);
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly metaService: MetaService = inject(MetaService);
	private readonly snackbarService: SnackbarService = inject(SnackbarService);
	private readonly aiService: AIService = inject(AIService);
	private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly apiService: ApiService = inject(ApiService);

	registrationRequest$: Subscription | undefined;
	registrationForm: FormGroup = this.formBuilder.group<RegistrationForm>({
		name: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(4),
			Validators.maxLength(32),
			Validators.pattern(this.helperService.getRegex('username')),
			Validators.pattern(this.helperService.getRegex('no-whitespace'))
		]),
		email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
		password: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(6),
			Validators.maxLength(48),
			Validators.pattern(this.helperService.getRegex('password'))
		]),
		terms: this.formBuilder.nonNullable.control(true, [Validators.requiredTrue])
	});
	registrationFormStage: string = 'Registration';

	invitedByUser: User | undefined;
	invitedByUserRequest$: Subscription | undefined;

	ngOnInit(): void {
		/** Apply Data */

		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();

		/** Set not allowed values */

		this.onUpdateRegistrationForm();
	}

	ngOnDestroy(): void {
		[this.invitedByUserRequest$, this.registrationRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setResolver(): void {
		const invitedBy: string = String(this.activatedRoute.snapshot.queryParamMap.get('invitedBy') || '');

		if (invitedBy) {
			const userGetAllDto: UserGetAllDto = {
				username: invitedBy,
				page: 1,
				size: 10
			};

			this.invitedByUserRequest$?.unsubscribe();
			this.invitedByUserRequest$ = this.userService.getAll(userGetAllDto).subscribe({
				next: (userList: User[]) => (this.invitedByUser = userList[0]),
				error: (error: any) => console.error(error)
			});
		}
	}

	setMetaTags(): void {
		const title: string = 'Create Your Free Account - Quick Registration';

		// prettier-ignore
		const description: string = 'Register for free and become a valued member of Takabase ever-growing community. Creating your account is quick and straightforward, taking just a minute. Start exploring Takabase and connect with others today';

		const metaOpenGraph: MetaOpenGraph = {
			['og:title']: title,
			['og:description']: description,
			['og:type']: 'website'
		};

		const metaTwitter: MetaTwitter = {
			['twitter:title']: title,
			['twitter:description']: description
		};

		this.metaService.setMeta(metaOpenGraph, metaTwitter);
	}

	onUpdateRegistrationForm(): void {
		if (this.platformService.isBrowser()) {
			const value: Value = getValue(this.firebaseService.getRemoteConfig(), 'forbiddenUsername');
			const valueForbiddenUsername: string[] = JSON.parse(value.asString());

			const abstractControl: AbstractControl = this.registrationForm.get('name');
			const abstractControlValidator: (...args: any) => ValidatorFn = this.helperService.getCustomValidator('not');

			abstractControl.addValidators([abstractControlValidator(valueForbiddenUsername)]);
			abstractControl.updateValueAndValidity();
		}
	}

	onSubmitRegistrationForm(): void {
		// prettier-ignore
		if (this.helperService.getFormValidation(this.registrationForm)) {
			this.registrationForm.disable();
			this.registrationFormStage = 'Moderation';

			const userCreateDto: UserCreateDto = {
				...this.registrationForm.value
			};

			/** Moderate and registration */

			this.registrationRequest$?.unsubscribe();
			this.registrationRequest$ = this.aiService
				.getModerationOpenAI(this.aiService.getModerationCreateTextDto({ name: userCreateDto.name }))
				.pipe(
					tap(() => (this.registrationFormStage = 'Saving')),
					switchMap(() => from(createUserWithEmailAndPassword(this.firebaseService.getAuth(), userCreateDto.email, userCreateDto.password))),
					catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)),
					switchMap((userCredential: UserCredential) => {
						return this.userService.create(userCreateDto).pipe(
							switchMap(() => userCredential.user.reload()),
							switchMap(() => this.authorizationService.setPopulate(userCredential))
						);
					})
				)
				.subscribe({
					next: (currentUser: CurrentUser) => {
						this.router
							.navigate(['/', currentUser.displayName])
							.then(() => this.snackbarService.success('Success', 'Welcome aboard!'));
					},
					error: () => {
						this.registrationForm.enable();
						this.registrationFormStage = 'Registration';
					}
				});
		}
	}
}
