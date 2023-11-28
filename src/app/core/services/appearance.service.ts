/** @format */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PlatformService } from './platform.service';
import { HttpClient } from '@angular/common/http';
import { from, fromEvent, Observable, of, switchMap } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { Appearance } from '../models/appearance.model';
import { HelperService } from './helper.service';
import { CookieService } from './cookie.service';
import {
	AngularFirestore,
	CollectionReference,
	DocumentData
} from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat';
import { DocumentReference } from '@angular/fire/compat/firestore/interfaces';
import { Meta } from '@angular/platform-browser';
import { Coords } from 'colorjs.io/types/src/color';
import Color from 'colorjs.io';

@Injectable({
	providedIn: 'root'
})
export class AppearanceService {
	collectionOrigin: string = '/appearance';

	constructor(
		@Inject(DOCUMENT)
		private document: Document,
		private platformService: PlatformService,
		private httpClient: HttpClient,
		private meta: Meta,
		private helperService: HelperService,
		private cookieService: CookieService,
		private angularFirestore: AngularFirestore
	) {}

	/** Utility */

	getCSSColor(name: string, format: string): string {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			const colorName: string = window
				.getComputedStyle(this.document.documentElement)
				.getPropertyValue(name)
				.trim();

			if (colorName) {
				const colorCoords: Coords = [0, 0, 0];
				const color: Color = new Color({
					space: 'oklch',
					coords: colorCoords
				});

				colorName
					.split(/\s/g)
					.forEach((value: string, index: number) => (color.coords[index] = parseFloat(value)));

				return color.to('srgb').toString({ format });
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
			'pageScrollToTop',
			'pageScrollInfinite',
			'pageRedirectHome',
			'theme',
			'themeBackground',
			'themePrism',
			'windowButtonPosition'
		];

		if (appearance) {
			settingsList.forEach((key: string) => {
				const value: any = appearance[key];

				const cookieKey: string = this.helperService.setCamelCaseToDashCase(key);
				const cookieValue: any = typeof value === 'boolean' ? String(+value) : value;

				this.cookieService.setItem(cookieKey, cookieValue);
			});
		} else {
			settingsList.forEach((key: string) => {
				this.cookieService.removeItem(this.helperService.setCamelCaseToDashCase(key));
			});
		}

		/** Set theme settings */

		this.setTheme(appearance?.theme || null);
		this.setThemeBackground(appearance?.themeBackground || null);
		this.setThemePrism(appearance?.themePrism || null);
	}

	setLoader(toggle: boolean): void {
		if (toggle) {
			// this.document.querySelector('[data-loader]').remove();
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

			this.cookieService.setItem(name, content);

			this.meta.updateTag({ name, content }, selectorDark);
			this.meta.updateTag({ name, content }, selectorLight);
		} else {
			/** Remove */

			this.cookieService.removeItem(name);

			this.meta.updateTag({ name, content: '#191e24' }, selectorDark);
			this.meta.updateTag({ name, content: '#f2f2f2' }, selectorLight);
		}
	}

	setThemeBackground(themeBackground: string | null): void {
		// prettier-ignore
		const backgroundElement: HTMLElement | null = this.document.querySelector('[data-theme-background]');
		const backgroundValue: string = themeBackground || 'slanted-gradient';

		if (backgroundElement.dataset.themeBackground !== backgroundValue) {
			this.httpClient
				.get('/assets/backgrounds/' + backgroundValue + '.svg', {
					responseType: 'text'
				})
				.subscribe({
					next: (svg: string) => {
						backgroundElement.innerHTML = svg;
						backgroundElement.dataset.themeBackground = backgroundValue;
					},
					error: (error: any) => console.error(error)
				});
		}
	}

	setThemePrism(themePrism: string | null): void {
		// prettier-ignore
		const setPrismLink = (theme: string): void => {
			const linkElement: HTMLLinkElement | null = this.document.querySelector('[data-theme-prism]');
      const linkElementUpdate: boolean = linkElement.dataset.themePrism !== theme

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

	getCollection(firebaseId: string): Observable<firebase.firestore.DocumentSnapshot<DocumentData>> {
		return this.angularFirestore
			.collection(this.collectionOrigin, (collectionReference: CollectionReference) => {
				return collectionReference.where('firebaseId', '==', firebaseId);
			})
			.get()
			.pipe(
				switchMap((querySnapshot: firebase.firestore.QuerySnapshot) => {
					if (querySnapshot.docs.length) {
						return of(querySnapshot.docs.shift());
					} else {
						const appearance: Appearance = {
							dropdownBackdrop: false,
							firebaseId,
							language: 'en-US',
							markdownMonospace: true,
							pageRedirectHome: false,
							pageScrollInfinite: false,
							pageScrollToTop: false,
							theme: 'auto',
							themeBackground: 'slanted-gradient',
							themePrism: 'auto',
							windowButtonPosition: 'left'
						};

						// prettier-ignore
						return from(this.angularFirestore.collection(this.collectionOrigin).add(appearance)).pipe(
							switchMap((documentReference: DocumentReference<unknown>) => {
								return from(documentReference.get());
							})
						);
					}
				}),
				tap((queryDocumentSnapshot: firebase.firestore.DocumentSnapshot<DocumentData>) => {
					this.setSettings(queryDocumentSnapshot.data() as Appearance);
				})
			);
	}
}
