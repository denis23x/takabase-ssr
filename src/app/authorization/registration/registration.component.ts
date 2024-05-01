/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
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
import { OauthComponent } from '../../standalone/components/oauth/oauth.component';
import { Subscription, switchMap } from 'rxjs';
import { BadgeErrorComponent } from '../../standalone/components/badge-error/badge-error.component';
import { CommonModule } from '@angular/common';
import { AIService } from '../../core/services/ai.service';
import { AIModerateTextDto } from '../../core/dto/ai/ai-moderate-text.dto';
import { UserCreateDto } from '../../core/dto/user/user-create.dto';
import { AvatarComponent } from '../../standalone/components/avatar/avatar.component';
import { UserUrlPipe } from '../../standalone/pipes/user-url.pipe';
import { DayjsPipe } from '../../standalone/pipes/dayjs.pipe';

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
		OauthComponent,
		BadgeErrorComponent,
		AvatarComponent,
		UserUrlPipe,
		DayjsPipe
	],
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

	registrationRequest$: Subscription | undefined;
	registrationForm: FormGroup = this.formBuilder.group<RegistrationForm>({
		name: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.minLength(4),
			Validators.maxLength(24)
		]),
		email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
		password: this.formBuilder.nonNullable.control('', [
			Validators.required,
			Validators.pattern(this.helperService.getRegex('password'))
		]),
		terms: this.formBuilder.nonNullable.control(true, [Validators.requiredTrue])
	});

	invitedByUser: User | undefined;
	invitedByUserRequest$: Subscription | undefined;

	ngOnInit(): void {
		/** Apply Data */

		this.setResolver();

		/** Apply SEO meta tags */

		this.setMetaTags();
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.invitedByUserRequest$, this.registrationRequest$].forEach(($: Subscription) => $?.unsubscribe());
	}

	setResolver(): void {
		// prettier-ignore
		const invitedById: number = Number(this.activatedRoute.snapshot.queryParamMap.get('invitedBy') || '');

		if (invitedById) {
			this.invitedByUserRequest$?.unsubscribe();
			this.invitedByUserRequest$ = this.userService.getOne(invitedById).subscribe({
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

			/** Moderate and registration */

			this.registrationRequest$?.unsubscribe();
			this.registrationRequest$ = this.aiService
				.moderateText(aiModerateTextDto)
				.pipe(switchMap(() => this.authorizationService.onRegistration(userCreateDto)))
				.subscribe({
					next: (user: User) => {
						this.router
							.navigate([this.userService.getUserUrl(user)])
							.then(() => this.snackbarService.success('Success', 'Welcome to our website'));
					},
					error: () => this.registrationForm.enable()
				});
		}
	}
}
