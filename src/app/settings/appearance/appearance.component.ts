/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Data, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { AppScrollIntoViewDirective } from '../../standalone/directives/app-scroll-into-view.directive';
import { SettingsUpdateDto } from '../../core/dto/settings/settings-update.dto';
import { SettingsService } from '../../core/services/settings.service';
import { Settings } from '../../core/models/settings.model';
import { AppearanceService } from '../../core/services/appearance.service';

interface AppearanceForm {
	theme: FormControl<string>;
	themeBackground: FormControl<string>;
	themePrism: FormControl<string>;
	language: FormControl<string>;
	pageScrollToTop: FormControl<boolean>;
	pageScrollInfinite: FormControl<boolean>;
	pageRedirectHome: FormControl<boolean>;
	markdownMonospace: FormControl<boolean>;
	windowButtonPosition: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		DropdownComponent,
		AppScrollIntoViewDirective
	],
	selector: 'app-settings-appearance',
	templateUrl: './appearance.component.html'
})
export class SettingsAppearanceComponent implements OnInit, OnDestroy {
	activatedRouteData$: Subscription | undefined;

	appearanceForm: FormGroup | undefined;
	appearanceForm$: Subscription | undefined;

	appearanceThemeList: string[] = [];
	appearanceThemeBackgroundList: string[] = [];
	appearanceThemePrismList: string[] = [];

	appearanceLanguageList: string[] = ['English', 'Italian', 'French'];
	appearanceButtonsList: string[] = ['left', 'right'];

	appearanceTransformList: string[] = [
		'theme',
		'themeBackground',
		'themePrism'
	];

	constructor(
		private formBuilder: FormBuilder,
		private authService: AuthService,
		private settingsService: SettingsService,
		private activatedRoute: ActivatedRoute,
		private appearanceService: AppearanceService
	) {
		// prettier-ignore
		this.appearanceForm = this.formBuilder.group<AppearanceForm>({
			theme: this.formBuilder.nonNullable.control('', [Validators.required]),
      themeBackground: this.formBuilder.nonNullable.control('', [Validators.required]),
      themePrism: this.formBuilder.nonNullable.control('', [Validators.required]),
      language: this.formBuilder.nonNullable.control('', [Validators.required]),
      pageScrollToTop: this.formBuilder.control(null, [Validators.required]),
      pageScrollInfinite: this.formBuilder.control(null, [Validators.required]),
      pageRedirectHome: this.formBuilder.control(null, [Validators.required]),
      markdownMonospace: this.formBuilder.control(null, [Validators.required]),
      windowButtonPosition: this.formBuilder.nonNullable.control('', [Validators.required]),
		});
	}

	ngOnInit(): void {
		this.activatedRouteData$ = this.activatedRoute.data
			.pipe(map((data: Data) => data.data))
			.subscribe({
				next: (settings: Settings) => {
					// prettier-ignore
					this.appearanceTransformList.forEach((key: string) => {
					  settings[key] = this.getTransformListValue(settings[key], key);
					});

					this.appearanceForm.patchValue(settings);
					this.appearanceForm.markAllAsTouched();
				},
				error: (error: any) => console.error(error)
			});

		this.appearanceForm$ = this.appearanceForm.valueChanges.subscribe({
			next: (value: any) => {
				this.appearanceForm.disable({ emitEvent: false });

				const settingsUpdateDto: SettingsUpdateDto = {
					...value
				};

				// prettier-ignore
				this.appearanceTransformList.forEach((key: string) => {
          settingsUpdateDto[key] = this.getTransformListValue(settingsUpdateDto[key], key, true);
				});

				this.settingsService.update(settingsUpdateDto).subscribe({
					next: (settings: Settings) => {
						this.authService.setUser({ settings });

						this.appearanceForm.enable({ emitEvent: false });
						this.appearanceService.setPageRedirectHome();
					},
					error: () => this.appearanceForm.enable({ emitEvent: false })
				});
			},
			error: (error: any) => console.error(error)
		});

		/** Transform appearance list */

		this.setTransformList();
	}

	ngOnDestroy(): void {
		// prettier-ignore
		[this.activatedRouteData$, this.appearanceForm$].forEach($ => $?.unsubscribe());
	}

	setTransformList(): void {
		this.appearanceThemeList = environment.themes
			.sort()
			.map((theme: string) => {
				return this.getTransformListValue(theme, 'theme');
			});

		this.appearanceThemeBackgroundList = environment.backgrounds
			.sort()
			.map((themeBackground: string) => {
				return this.getTransformListValue(themeBackground, 'themeBackground');
			});

		this.appearanceThemePrismList = environment.prism
			.sort()
			.map((themePrism: string) => {
				return this.getTransformListValue(themePrism, 'themePrism');
			});
	}

	getTransformListValue(value: string, key: string, update?: boolean): string {
		const getCase = (value: string): string => {
			return update ? value.toLowerCase() : value.toUpperCase();
		};

		switch (key) {
			case 'theme': {
				return getCase(value.charAt(0)) + value.slice(1);
			}
			case 'themeBackground':
			case 'themePrism': {
				const separator: string = update ? ' ' : '-';
				const join: string = update ? '-' : ' ';

				return value
					.split(separator)
					.map((name: string) => getCase(name.charAt(0)) + name.slice(1))
					.join(join);
			}
			default:
				return value;
		}
	}
}
