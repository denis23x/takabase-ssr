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
import { User } from '../../core/models/user.model';
import { MetaOpenGraph, MetaTwitter } from '../../core/models/meta.model';
import { MetaService } from '../../core/services/meta.service';
import { InputTrimWhitespaceDirective } from '../../standalone/directives/app-input-trim-whitespace.directive';
import { SnackbarService } from '../../core/services/snackbar.service';
import { SignInComponent } from '../../standalone/components/sign-in/sign-in.component';
import { of, Subscription, switchMap, throwError } from 'rxjs';
import { BadgeErrorComponent } from '../../standalone/components/badge-error/badge-error.component';
import { CommonModule } from '@angular/common';
import { AIService } from '../../core/services/ai.service';
import { AIModerateTextDto } from '../../core/dto/ai/ai-moderate-text.dto';
import { UserCreateDto } from '../../core/dto/user/user-create.dto';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { DayjsPipe } from '../../standalone/pipes/dayjs.pipe';
import { InputShowPassword } from '../../standalone/directives/app-input-show-password.directive';
import { User as FirebaseUser } from 'firebase/auth';
import { FirebaseService } from '../../core/services/firebase.service';
import { PlatformService } from '../../core/services/platform.service';
import { UserGetAllDto } from '../../core/dto/user/user-get-all.dto';
import { getValue, Value } from 'firebase/remote-config';
import { filter } from 'rxjs/operators';
import { CurrentUser } from '../../core/models/current-user.model';

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
		AvatarComponent,
		DayjsPipe,
		InputShowPassword
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

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	registrationAuthStateChanged$: Subscription | undefined;
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

	invitedByUser: User | undefined;
	invitedByUserRequest$: Subscription | undefined;

	ngOnInit(): void {
		/** Set not allowed values */

		this.onUpdateRegistrationForm();

		/** Listen Auth State Changed */

		if (this.platformService.isBrowser()) {
			this.registrationAuthStateChanged$?.unsubscribe();
			this.registrationAuthStateChanged$ = this.authorizationService
				.getAuthState()
				.pipe(filter((firebaseUser: FirebaseUser | null) => !!firebaseUser))
				.subscribe({
					next: () => {
						this.snackbarService.success('Success', 'Redirecting, please wait...', {
							duration: 8000
						});

						/** Disable form for interact */

						this.registrationForm.disable();

						/** Get user and redirect */

						this.currentUser$?.unsubscribe();
						this.currentUser$ = this.authorizationService
							.getCurrentUser()
							.pipe(filter((currentUser: CurrentUser | undefined) => !!currentUser))
							.subscribe({
								next: (currentUser: CurrentUser | undefined) => {
									this.router.navigate(['/', currentUser.name]).catch((error: any) => {
										this.helperService.setNavigationError(this.router.lastSuccessfulNavigation, error);
									});
								},
								error: (error: any) => console.error(error)
							});
					},
					error: () => this.registrationForm.enable()
				});
		}

		/** Apply Data */

		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		[
			this.currentUser$,
			this.invitedByUserRequest$,
			this.registrationAuthStateChanged$,
			this.registrationRequest$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setResolver(): void {
		const invitedId: number = Number(this.activatedRoute.snapshot.queryParamMap.get('invited') || '');

		if (invitedId) {
			this.invitedByUserRequest$?.unsubscribe();
			this.invitedByUserRequest$ = this.userService.getOne(invitedId).subscribe({
				next: (user: User) => (this.invitedByUser = user),
				error: (error: any) => console.error(error)
			});
		}
	}

	setMetaTags(): void {
		const title: string = 'Registration';
		const description: string = 'Creating an account with us is quick and easy';

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
		if (this.helperService.getFormValidation(this.registrationForm)) {
			this.registrationForm.disable();

			const userCreateDto: UserCreateDto = {
				...this.registrationForm.value
			};

			const aiModerateTextDto: AIModerateTextDto = {
				model: 'text-moderation-stable',
				input: userCreateDto.name
			};

			const userGetAllDto: UserGetAllDto = {
				username: userCreateDto.name,
				page: 1,
				size: 10
			};

			/** Moderate and registration */

			this.registrationRequest$?.unsubscribe();
			this.registrationRequest$ = this.aiService
				.moderateText(aiModerateTextDto)
				.pipe(
					switchMap(() => this.userService.getAll(userGetAllDto)),
					switchMap((userList: User[]) => {
						if (userList.length) {
							this.snackbarService.error('Nope', 'The name "' + userGetAllDto.username + '" is already in use');

							return throwError(() => new Error());
						} else {
							return of([]);
						}
					}),
					switchMap(() => this.authorizationService.onRegistration(userCreateDto))
				)
				.subscribe({
					next: () => console.debug('Signed up with email and password'),
					error: () => this.registrationForm.enable()
				});
		}
	}
}
