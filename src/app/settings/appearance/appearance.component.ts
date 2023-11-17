/** @format */

import { Component, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { from, Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { environment } from '../../../environments/environment';
import { AppScrollPresetDirective } from '../../standalone/directives/app-scroll-preset.directive';
import { Appearance } from '../../core/models/appearance.model';
import { AppearanceService } from '../../core/services/appearance.service';
import { CurrentUser } from '../../core/models/current-user.model';
import { AuthorizationService } from '../../core/services/authorization.service';
import { DocumentData } from '@angular/fire/compat/firestore';
import { AppSkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import firebase from 'firebase/compat';

interface AppearanceForm {
	theme: FormControl<string>;
	themeBackground: FormControl<string>;
	themePrism: FormControl<string>;
	language: FormControl<string>;
	pageScrollToTop: FormControl<boolean>;
	pageScrollInfinite: FormControl<boolean>;
	pageRedirectHome: FormControl<boolean>;
	markdownMonospace: FormControl<boolean>;
	dropdownBackdrop: FormControl<boolean>;
	windowButtonPosition: FormControl<string>;
}

@Component({
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		DropdownComponent,
		AppScrollPresetDirective,
		AppSkeletonDirective
	],
	selector: 'app-settings-appearance',
	templateUrl: './appearance.component.html'
})
export class SettingsAppearanceComponent implements OnInit, OnDestroy {
	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	appearanceForm: FormGroup | undefined;
	appearanceForm$: Subscription | undefined;
	appearanceFormSkeletonToggle: boolean = true;

	appearanceCollection: firebase.firestore.QueryDocumentSnapshot<DocumentData> | undefined;
	appearanceCollection$: Subscription | undefined;
	appearanceCollectionUpdate$: Subscription | undefined;

	appearanceThemeList: string[] = [];
	appearanceThemeBackgroundList: string[] = [];
	appearanceThemePrismList: string[] = [];

	appearanceLanguageList: string[] = ['en-US'];
	appearanceButtonsList: string[] = ['left', 'right'];

	appearanceTransformList: string[] = ['theme', 'themeBackground', 'themePrism'];

	constructor(
		private formBuilder: FormBuilder,
		private appearanceService: AppearanceService,
		private authorizationService: AuthorizationService
	) {
		this.appearanceForm = this.formBuilder.group<AppearanceForm>({
			theme: this.formBuilder.nonNullable.control('', [Validators.required]),
			themeBackground: this.formBuilder.nonNullable.control('', [Validators.required]),
			themePrism: this.formBuilder.nonNullable.control('', [Validators.required]),
			language: this.formBuilder.nonNullable.control('', [Validators.required]),
			pageScrollToTop: this.formBuilder.control(null, [Validators.required]),
			pageScrollInfinite: this.formBuilder.control(null, [Validators.required]),
			pageRedirectHome: this.formBuilder.control(null, [Validators.required]),
			markdownMonospace: this.formBuilder.control(null, [Validators.required]),
			dropdownBackdrop: this.formBuilder.control(null, [Validators.required]),
			windowButtonPosition: this.formBuilder.nonNullable.control('', [Validators.required])
		});
	}

	ngOnInit(): void {
		/** Apply Data */

		this.currentUser$?.unsubscribe();
		this.currentUser$ = this.authorizationService
			.getCurrentUser()
			.pipe(tap((currentUser: CurrentUser) => (this.currentUser = currentUser)))
			.subscribe({
				next: () => this.setResolver(),
				error: (error: any) => console.error(error)
			});

		this.appearanceForm$?.unsubscribe();
		this.appearanceForm$ = this.appearanceForm.valueChanges.subscribe({
			next: (value: any) => {
				this.appearanceForm.disable({ emitEvent: false });

				const appearance: Appearance = {
					...value
				};

				this.appearanceTransformList.forEach((key: string) => {
					appearance[key] = this.getTransformListValue(appearance[key], key, true);
				});

				// prettier-ignore
				const appearanceCollectionUpdate$: Observable<void> = from(this.appearanceCollection.ref.update(appearance));

				/** Firestore */

				this.appearanceCollectionUpdate$?.unsubscribe();
				this.appearanceCollectionUpdate$ = appearanceCollectionUpdate$.subscribe({
					next: () => {
						this.appearanceService.setSettings(appearance as Appearance);

						this.appearanceForm.enable({ emitEvent: false });
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
		[
			this.currentUser$,
			this.appearanceForm$,
			this.appearanceCollection$,
			this.appearanceCollectionUpdate$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	// prettier-ignore
	setResolver(): void {
		this.appearanceCollection$?.unsubscribe();
    this.appearanceCollection$ = this.appearanceService
			.getCollection(this.currentUser)
			.pipe(map((documentData: firebase.firestore.QueryDocumentSnapshot<DocumentData>) => {
        this.appearanceCollection = documentData;

        return this.appearanceCollection.data() as Appearance;
      }))
			.subscribe({
				next: (appearance: Appearance) => {
					this.appearanceTransformList.forEach((key: string) => {
						appearance[key] = this.getTransformListValue(appearance[key], key);
					});

					this.appearanceForm.patchValue(appearance, { emitEvent: false });
					this.appearanceForm.markAllAsTouched();
          this.appearanceFormSkeletonToggle = false;
				},
				error: (error: any) => console.error(error)
			});
	}

	setTransformList(): void {
		this.appearanceThemeList = environment.themes.sort().map((theme: string) => {
			return this.getTransformListValue(theme, 'theme');
		});

		this.appearanceThemeBackgroundList = environment.backgrounds
			.sort()
			.map((themeBackground: string) => {
				return this.getTransformListValue(themeBackground, 'themeBackground');
			});

		this.appearanceThemePrismList = environment.prism.themes.sort().map((themePrism: string) => {
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
