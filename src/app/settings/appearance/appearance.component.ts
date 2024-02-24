/** @format */

import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
	FormBuilder,
	FormControl,
	FormGroup,
	ReactiveFormsModule,
	Validators
} from '@angular/forms';
import { from, Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { DropdownComponent } from '../../standalone/components/dropdown/dropdown.component';
import { environment } from '../../../environments/environment';
import { ScrollPresetDirective } from '../../standalone/directives/app-scroll-preset.directive';
import { Appearance } from '../../core/models/appearance.model';
import { AppearanceService } from '../../core/services/appearance.service';
import { CurrentUser } from '../../core/models/current-user.model';
import { AuthorizationService } from '../../core/services/authorization.service';
import { DocumentData } from '@angular/fire/compat/firestore';
import { SkeletonDirective } from '../../standalone/directives/app-skeleton.directive';
import { SvgIconComponent } from '../../standalone/components/svg-icon/svg-icon.component';
import { MarkdownPipe } from '../../standalone/pipes/markdown.pipe';
import { SanitizerPipe } from '../../standalone/pipes/sanitizer.pipe';
import { HttpClient } from '@angular/common/http';
import { PlatformService } from '../../core/services/platform.service';
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
	advertisement: FormControl<boolean>;
	themePublic: FormControl<boolean>;
}

@Component({
	standalone: true,
	imports: [
		RouterModule,
		ReactiveFormsModule,
		DropdownComponent,
		ScrollPresetDirective,
		SkeletonDirective,
		SvgIconComponent,
		MarkdownPipe,
		SanitizerPipe
	],
	selector: 'app-settings-appearance',
	templateUrl: './appearance.component.html'
})
export class SettingsAppearanceComponent implements OnInit, OnDestroy {
	private readonly formBuilder: FormBuilder = inject(FormBuilder);
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly appearanceService: AppearanceService = inject(AppearanceService);
	private readonly authorizationService: AuthorizationService = inject(AuthorizationService);
	private readonly platformService: PlatformService = inject(PlatformService);

	currentUser: CurrentUser | undefined;
	currentUser$: Subscription | undefined;

	currentUserCollection: firebase.firestore.QueryDocumentSnapshot<DocumentData> | undefined;
	currentUserCollection$: Subscription | undefined;
	currentUserCollectionUpdate$: Subscription | undefined;

	appearanceForm: FormGroup = this.formBuilder.group<AppearanceForm>({
		theme: this.formBuilder.nonNullable.control('', [Validators.required]),
		themeBackground: this.formBuilder.nonNullable.control('', [Validators.required]),
		themePrism: this.formBuilder.nonNullable.control('', [Validators.required]),
		language: this.formBuilder.nonNullable.control('', [Validators.required]),
		pageScrollToTop: this.formBuilder.control(null, [Validators.required]),
		pageScrollInfinite: this.formBuilder.control(null, [Validators.required]),
		pageRedirectHome: this.formBuilder.control(null, [Validators.required]),
		markdownMonospace: this.formBuilder.control(null, [Validators.required]),
		dropdownBackdrop: this.formBuilder.control(null, [Validators.required]),
		windowButtonPosition: this.formBuilder.nonNullable.control('', [Validators.required]),
		advertisement: this.formBuilder.control(null, [Validators.required]),
		themePublic: this.formBuilder.control(null, [Validators.required])
	});
	appearanceForm$: Subscription | undefined;
	appearanceFormSkeletonToggle: boolean = true;

	appearanceThemeList: string[] = [];
	appearanceThemeBackgroundList: string[] = [];

	appearanceThemePrismList: string[] = [];
	appearanceThemePrismPreviewToggle: boolean = false;
	appearanceThemePrismMarkdown: string | undefined;
	appearanceThemePrismMarkdown$: Subscription | undefined;
	appearanceThemePrismMarkdownSkeletonToggle: boolean = true;

	appearanceLanguageList: string[] = ['en-US'];
	appearanceButtonsList: string[] = ['left', 'right'];

	appearanceTransformList: string[] = ['theme', 'themeBackground', 'themePrism'];

	ngOnInit(): void {
		/** Apply Data */

		this.setSkeleton();
		this.setResolver();

		/** Appearance Form */

		this.appearanceForm$?.unsubscribe();
		this.appearanceForm$ = this.appearanceForm.valueChanges.subscribe({
			next: (value: any) => {
				this.appearanceForm.disable({ emitEvent: false });

				const appearance: Appearance = {
					...value
				};

				this.appearanceTransformList.forEach((key: string) => {
					// @ts-ignore
					appearance[key] = this.getTransformListValue(appearance[key], key, true);
				});

				// prettier-ignore
				const appearanceCollectionUpdate$: Observable<void> = from(this.currentUserCollection.ref.update({ appearance }))

				/** Firestore */

				this.currentUserCollection$?.unsubscribe();
				this.currentUserCollection$ = appearanceCollectionUpdate$.subscribe({
					next: () => {
						this.appearanceService.setSettings(appearance);
						this.appearanceForm.enable({ emitEvent: false });
					},
					error: () => this.appearanceForm.enable({ emitEvent: false })
				});
			},
			error: (error: any) => console.error(error)
		});

		/** Transform appearance list */

		this.setTransformList();

		/** Download Prism example */

		this.setPrismMarkdown();
	}

	ngOnDestroy(): void {
		[
			this.currentUser$,
			this.currentUserCollection$,
			this.currentUserCollectionUpdate$,
			this.appearanceForm$,
			this.appearanceThemePrismMarkdown$
		].forEach(($: Subscription) => $?.unsubscribe());
	}

	setSkeleton(): void {
		this.appearanceForm.reset();
		this.appearanceFormSkeletonToggle = true;
	}

	setResolver(): void {
		if (this.platformService.isBrowser()) {
			this.currentUser$?.unsubscribe();
			this.currentUser$ = this.authorizationService
				.getCurrentUser()
				.pipe(
					filter((currentUser: CurrentUser | undefined) => !!currentUser),
					tap((currentUser: CurrentUser) => (this.currentUser = currentUser))
				)
				.subscribe({
					next: () => {
						this.currentUserCollection$?.unsubscribe();
						this.currentUserCollection$ = this.appearanceService
							.getCollection(this.currentUser.firebase.uid)
							.pipe(
								// prettier-ignore
								map((documentSnapshot: firebase.firestore.QueryDocumentSnapshot<DocumentData>) => {
									this.currentUserCollection = documentSnapshot;

									const currentUserCollection: any = this.currentUserCollection.data();
									const currentUserCollectionAppearance: Appearance = currentUserCollection.appearance;

									return currentUserCollectionAppearance;
								})
							)
							.subscribe({
								next: (appearance: Appearance) => {
									this.appearanceTransformList.forEach((key: string) => {
										// @ts-ignore
										appearance[key] = this.getTransformListValue(appearance[key], key);
									});

									this.appearanceForm.patchValue(appearance, { emitEvent: false });
									this.appearanceForm.markAllAsTouched();
									this.appearanceFormSkeletonToggle = false;
								},
								error: (error: any) => console.error(error)
							});
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	setTransformList(): void {
		this.appearanceThemeList = ['auto', ...environment.themes.sort()].map((theme: string) => {
			return this.getTransformListValue(theme, 'theme');
		});

		// prettier-ignore
		this.appearanceThemeBackgroundList = environment.backgrounds.sort().map((themeBackground: string) => {
      return this.getTransformListValue(themeBackground, "themeBackground")
    })

		// prettier-ignore
		this.appearanceThemePrismList = ["auto", ...environment.prism.themes.sort()].map((themePrism: string) => {
      return this.getTransformListValue(themePrism, "themePrism")
    })
	}

	setPrismMarkdown(): void {
		if (this.platformService.isBrowser()) {
			this.appearanceThemePrismMarkdown$?.unsubscribe();
			this.appearanceThemePrismMarkdown$ = this.httpClient
				.get('/assets/markdown/settings/appearance/prism.md', {
					responseType: 'text'
				})
				.subscribe({
					next: (prose: string) => {
						this.appearanceThemePrismMarkdown = prose;
						this.appearanceThemePrismMarkdownSkeletonToggle = false;
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	getTransformListValue(value: string, key: string, update?: boolean): string {
		const getCase = (valueTemp: string): string => {
			return update ? valueTemp.toLowerCase() : valueTemp.toUpperCase();
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
