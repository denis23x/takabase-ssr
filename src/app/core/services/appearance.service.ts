/** @format */

import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PlatformService } from './platform.service';
import { HttpClient } from '@angular/common/http';
import { from, fromEvent, Observable, of, switchMap } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { Route, Router, Routes } from '@angular/router';
import { routesRedirect } from '../../app.routing.module';
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
		private router: Router,
		private helperService: HelperService,
		private cookieService: CookieService,
		private angularFirestore: AngularFirestore
	) {}

	/** Utility */

	getCSSPropertyValue(property: string): string {
		if (this.platformService.isBrowser()) {
			const window: Window = this.platformService.getWindow();

			return window
				.getComputedStyle(this.document.documentElement)
				.getPropertyValue(property)
				.trim();
		}

		return '';
	}

	getHSLToRGB = (h: number, s: number, l: number): number[] => {
		s /= 100;
		l /= 100;

		/** https://www.30secondsofcode.org/js/s/hsl-to-rgb */

		const k = (n: number): number => (n + h / 30) % 12;
		const a: number = s * Math.min(l, 1 - l);

		const f = (n: number): number => {
			return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
		};

		return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
	};

	getHSLToHEX = (h: number, s: number, l: number): string[] => {
		l /= 100;

		/** https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex/54014428#54014428 */

		const a: number = (s * Math.min(l, 1 - l)) / 100;
		const f = (n: number) => {
			const k: number = (n + h / 30) % 12;
			const color: number = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0');
		};

		return [f(0), f(8), f(4)];
	};

	setSettings(appearance: Appearance | null): void {
		const settingsList: string[] = [
			'theme',
			'themePrism',
			'themeBackground',
			'language',
			'markdownMonospace',
			'windowButtonPosition',
			'pageScrollToTop',
			'pageScrollInfinite',
			'pageRedirectHome'
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

		this.setPageRedirectHome();

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
		if (theme) {
			this.document.documentElement.setAttribute('data-theme', theme);
		} else {
			this.document.documentElement.removeAttribute('data-theme');
		}

		/** TODO: Update meta */

		// const value: string = this.getCSSPropertyValue('--su');
		//
		// // prettier-ignore
		// const [h, s, l]: number[] = value.split(/\s/g).map((value: string) => Number(value.replace('%', '')));
		// const valueList: string[] = this.getHSLToHEX(h, s, l);
		//
		// const propertyValue: string = '#' + valueList.join('');
		// const property: string = 'theme-color';
		//
		// this.meta.updateTag({ name: property, content: propertyValue });
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
		const prismElement: HTMLLinkElement | null = this.document.querySelector('[data-theme-prism]') as HTMLLinkElement;
		const prismValue: string = themePrism || 'default';

		if (prismElement.dataset.themePrism !== prismValue) {
			prismElement.href = 'prism-' + prismValue + '.css';
			prismElement.dataset.themePrism = prismValue;
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

	setPageRedirectHome(): void {
		const previousConfig: Routes = this.router.config;
		const previousHome: Route = previousConfig.find((route: Route) => {
			return route.path === '';
		});

		const nextConfig: Routes = routesRedirect(previousConfig);
		const nextHome: Route = nextConfig.find((route: Route) => {
			return route.path === '';
		});

		if (previousHome.redirectTo !== nextHome.redirectTo) {
			this.router.resetConfig(nextConfig);
		}
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
							themePrism: 'default',
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
