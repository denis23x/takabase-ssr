/** @format */

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
	PreloadAllModules,
	provideRouter,
	TitleStrategy,
	withEnabledBlockingInitialNavigation,
	withPreloading,
	withRouterConfig
} from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { HttpAuthInterceptor } from './core/interceptors/http.auth.interceptor';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { TitleService } from './core/services/title.service';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(withFetch()),
		provideClientHydration(),
		provideServiceWorker('ngsw-worker.js', {
			enabled: environment.pwa,
			registrationStrategy: 'registerWhenStable:30000'
		}),
		provideRouter(
			APP_ROUTES,
			withPreloading(PreloadAllModules),
			withEnabledBlockingInitialNavigation(),
			withRouterConfig({
				onSameUrlNavigation: 'reload'
			})
		),
		importProvidersFrom(provideFirebaseApp(() => initializeApp())),
		importProvidersFrom(provideStorage(() => getStorage())),
		importProvidersFrom(provideFirestore(() => getFirestore())),
		{
			provide: HTTP_INTERCEPTORS,
			useClass: HttpAuthInterceptor,
			multi: true
		},
		{
			provide: FIREBASE_OPTIONS,
			useValue: environment.firebase
		},
		{
			provide: TitleStrategy,
			useClass: TitleService
		}
	]
};
