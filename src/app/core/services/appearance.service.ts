/** @format */

import { inject, Injectable, NgZone } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PlatformService } from './platform.service';
import { HttpClient } from '@angular/common/http';
import { EMPTY, from, fromEvent, Observable, of, race, switchMap } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { Appearance } from '../models/appearance.model';
import { HelperService } from './helper.service';
import { CookiesService } from './cookies.service';
import { Meta } from '@angular/platform-browser';
import Color from 'colorjs.io';
import { FirebaseService } from './firebase.service';
import {
	collection,
	CollectionReference,
	doc,
	updateDoc,
	getDoc,
	DocumentReference,
	DocumentSnapshot
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root'
})
export class AppearanceService {
	private readonly document: Document = inject(DOCUMENT);
	private readonly platformService: PlatformService = inject(PlatformService);
	private readonly httpClient: HttpClient = inject(HttpClient);
	private readonly meta: Meta = inject(Meta);
	private readonly helperService: HelperService = inject(HelperService);
	private readonly cookiesService: CookiesService = inject(CookiesService);
	private readonly ngZone: NgZone = inject(NgZone);
	private readonly firebaseService: FirebaseService = inject(FirebaseService);
	private readonly apiService: ApiService = inject(ApiService);

	/** Utility */

	getPrefersColorScheme(): Observable<any> {
		if (this.platformService.isBrowser()) {
			return race(
				fromEvent(window.matchMedia('(prefers-color-scheme: dark)'), 'change'),
				fromEvent(window.matchMedia('(prefers-color-scheme: light)'), 'change')
			);
		}

		return EMPTY;
	}

	getCSSColor(name: string, format: string): string {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			const value: string = window.getComputedStyle(this.document.documentElement).getPropertyValue(name).trim();

			if (value) {
				const color: Color = new Color('oklch(' + value + ')');

				return color.to('sRGB').toString({ format });
			} else {
				return '';
			}
		}

		return '';
	}

	setSettings(appearance: Appearance | null): void {
		const settingsList: string[] = [
			'dropdownBackdrop',
			'language',
			'markdownMonospace',
			'pageRedirectHome',
			'pageScrollToTop',
			'pageScrollInfinite',
			'theme',
			'themeBackground',
			'themePrism',
			'windowButtonPosition'
		];

		if (appearance) {
			settingsList.forEach((key: string) => {
				// @ts-ignore
				const value: any = appearance[key];

				const cookieKey: string = this.helperService.setCamelCaseToDashCase(key);
				const cookieValue: any = typeof value === 'boolean' ? String(+value) : value;

				this.cookiesService.setItem(cookieKey, cookieValue);
			});
		} else {
			settingsList.forEach((key: string) => {
				this.cookiesService.removeItem(this.helperService.setCamelCaseToDashCase(key));
			});
		}

		/** Set theme settings */

		this.setTheme(appearance?.theme || null);
		this.setThemeBackground(appearance?.themeBackground || null);
		this.setThemePrism(appearance?.themePrism || null);
	}

	setLoader(toggle: boolean): void {
		if (toggle) {
			// TODO: Do something ..
		} else {
			this.document.querySelector('[data-loader]')?.remove();
		}
	}

	setTheme(theme: string | null): void {
		if (theme && theme !== 'auto') {
			this.document.documentElement.setAttribute('data-theme', theme);
		} else {
			this.document.documentElement.removeAttribute('data-theme');
		}

		/** Update theme-color meta tag */

		this.setThemeColor(theme);
	}

	setThemeColor(themeColor: string | null): void {
		const name: string = 'theme-color';

		const selectorDark: string = 'media="(prefers-color-scheme: dark)"';
		const selectorLight: string = 'media="(prefers-color-scheme: light)"';

		/** https://css-tricks.com/meta-theme-color-and-trickery/ */

		if (themeColor && themeColor !== 'auto') {
			const content: string = this.getCSSColor('--b2', 'hex');

			/** Set */

			this.cookiesService.setItem(name, content);

			this.meta.updateTag({ name, content }, selectorDark);
			this.meta.updateTag({ name, content }, selectorLight);
		} else {
			/** Remove */

			this.cookiesService.removeItem(name);

			this.meta.updateTag({ name, content: '#191e24' }, selectorDark);
			this.meta.updateTag({ name, content: '#f2f2f2' }, selectorLight);
		}
	}

	setThemeBackground(themeBackground: string | null): void {
		const backgroundElement: HTMLElement = this.document.querySelector('[data-theme-background]');
		const backgroundElementPattern: HTMLElement = this.document.querySelector('#theme-background');

		if (backgroundElement.dataset.themeBackground !== themeBackground) {
			const background: string = themeBackground || 'cosy-creatures';

			this.httpClient
				.get('/assets/backgrounds/' + background + '.svg', {
					responseType: 'text'
				})
				.subscribe({
					next: (svg: string) => {
						backgroundElementPattern.innerHTML = svg;
						backgroundElement.dataset.themeBackground = background;
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	setThemePrism(themePrism: string | null): void {
		const setPrismLink = (theme: string): void => {
			const linkElement: HTMLLinkElement | null = this.document.querySelector('[data-theme-prism]');
			const linkElementUpdate: boolean = linkElement.dataset.themePrism !== theme;

			if (linkElementUpdate) {
				linkElement.href = 'prism-' + theme + '.css';
				linkElement.dataset.themePrism = theme;
			}
		};

		if (themePrism && themePrism !== 'auto') {
			setPrismLink(themePrism);
		} else {
			if (this.platformService.isBrowser()) {
				const window: Window = this.platformService.getWindow();

				const schemeDark: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
				const schemeLight: MediaQueryList = window.matchMedia('(prefers-color-scheme: light)');

				if (schemeDark.matches) {
					setPrismLink('one-dark');
				}

				if (schemeLight.matches) {
					setPrismLink('one-light');
				}
			}
		}
	}

	setPageScrollInfinite(): Observable<boolean> {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			return fromEvent(window, 'scroll').pipe(
				map(() => {
					const heightScrolled: number = window.innerHeight + Math.round(window.scrollY);
					const heightBottom: number = this.document.body.offsetHeight;

					return heightScrolled >= heightBottom;
				}),
				filter((pageScrollInfinite: boolean) => pageScrollInfinite)
			);
		}

		return of(false);
	}

	/** Firestore */

	getAppearanceDefault(): Appearance {
		return {
			dropdownBackdrop: false,
			language: 'en-US',
			markdownMonospace: true,
			pageRedirectHome: false,
			pageScrollToTop: false,
			pageScrollInfinite: false,
			theme: 'auto',
			themeBackground: 'cosy-creatures',
			themePrism: 'auto',
			windowButtonPosition: 'left'
		};
	}

	getAppearance(firebaseUid: string): Observable<Appearance> {
		return this.ngZone.runOutsideAngular(() => {
			const userCollection: CollectionReference = collection(this.firebaseService.getFirestore(), '/users');
			const userDoc: DocumentReference = doc(userCollection, firebaseUid);

			return from(getDoc(userDoc)).pipe(
				catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)),
				map((documentSnapshot: DocumentSnapshot) => documentSnapshot.data()),
				switchMap((user: any) => {
					const appearance: Appearance | undefined = user?.appearance;

					if (appearance) {
						return of(appearance);
					} else {
						return this.setAppearance(firebaseUid, this.getAppearanceDefault());
					}
				}),
				tap((appearance: Appearance) => this.setSettings(appearance))
			);
		});
	}

	setAppearance(firebaseUid: string, appearance: Appearance): Observable<Appearance> {
		const userCollection: CollectionReference = collection(this.firebaseService.getFirestore(), '/users');
		const userDoc: DocumentReference = doc(userCollection, firebaseUid);

		return from(updateDoc(userDoc, { appearance })).pipe(
			catchError((firebaseError: FirebaseError) => this.apiService.setFirebaseError(firebaseError)),
			map(() => appearance)
		);
	}
}
