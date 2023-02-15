/** @format */

import { Component, OnInit, OnDestroy } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService, User, UserService, UserUpdateDto } from '../../core';
import { ActivatedRoute, Data, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';

interface AppearanceForm {
	theme: FormControl<string>;
	background: FormControl<string>;
	language: FormControl<string>;
	monospace: FormControl<boolean>;
	buttons: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [CommonModule, RouterModule, ReactiveFormsModule, DropdownComponent],
	selector: 'app-settings-appearance',
	templateUrl: './appearance.component.html'
})
export class SettingsAppearanceComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	authUser: User | undefined;
	authUser$: Subscription | undefined;

	appearanceForm: FormGroup | undefined;
	appearanceForm$: Subscription | undefined;
	appearanceIsSubmitted: boolean | false;

	appearanceThemeList: string[] = [
		'light',
		'dark',
		'cupcake',
		'bumblebee',
		'emerald',
		'corporate',
		'synthwave',
		'retro',
		'cyberpunk',
		'valentine',
		'halloween',
		'garden',
		'forest',
		'aqua',
		'lofi',
		'pastel',
		'fantasy',
		'wireframe',
		'black',
		'luxury',
		'dracula',
		'cmyk',
		'autumn',
		'business',
		'acid',
		'lemonade',
		'night',
		'coffee',
		'winter'
	];

	appearanceBackgroundList: string[] = [
		'abstract-envelope',
		'abstract-timekeeper',
		'bullseye-gradient',
		'confetti-doodles',
		'cornered-stairs',
		'dalmatian-spots',
		'diagonal-stripes',
		'diamond-sunset',
		'endless-constellation',
		'liquid-cheese',
		'pattern-randomized',
		'repeating-triangles',
		'slanted-gradient',
		'subtle-prism',
		'sun-tornado',
		'tortoise-shell',
		'zig-zag'
	];

	appearanceLanguageList: string[] = ['English', 'Italian', 'French'];

	appearanceButtonsList: string[] = ['left', 'right'];

	constructor(
		private formBuilder: FormBuilder,
		private userService: UserService,
		private authService: AuthService,
		private activatedRoute: ActivatedRoute
	) {
		// prettier-ignore
		this.appearanceForm = this.formBuilder.group<AppearanceForm>({
			theme: this.formBuilder.nonNullable.control('', [Validators.required]),
			background: this.formBuilder.nonNullable.control('', [Validators.required]),
			language: this.formBuilder.nonNullable.control('', [Validators.required]),
			monospace: this.formBuilder.control(null, [Validators.required]),
			buttons: this.formBuilder.nonNullable.control('', [Validators.required])
		});
	}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.parent?.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (user: User) => {
					this.authUser = user;

					this.appearanceForm.patchValue(user.settings);
					this.appearanceForm.markAllAsTouched();
				},
				error: (error: any) => console.error(error)
			});

		this.appearanceForm$ = this.appearanceForm.valueChanges.subscribe({
			next: (value: any) => {
				this.appearanceIsSubmitted = true;

				const userUpdateDto: UserUpdateDto = {
					settings: value
				};

				this.userService.update(this.authUser.id, userUpdateDto).subscribe({
					next: (user: User) => {
						this.authService.setUser(user);

						this.appearanceIsSubmitted = false;
					},
					error: () => (this.appearanceIsSubmitted = false)
				});
			},
			error: (error: any) => console.error(error)
		});
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.activatedRouteData$, this.appearanceForm$].forEach($ => $?.unsubscribe());
	}

	onChangeTheme(theme: string): void {
		this.appearanceForm.patchValue({ theme });
	}

	onChangeBackground(background: string): void {
		this.appearanceForm.patchValue({ background });
	}

	onChangeLanguage(language: string): void {
		this.appearanceForm.patchValue({ language });
	}
}
