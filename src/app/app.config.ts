/** @format */

import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
	PreloadAllModules,
	provideRouter,
	TitleStrategy,
	withComponentInputBinding,
	withEnabledBlockingInitialNavigation,
	withPreloading,
	withRouterConfig
} from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { httpAuthorizationInterceptor } from './core/interceptors/http.authorization.interceptor';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { TitleService } from './core/services/title.service';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(withFetch(), withInterceptors([httpAuthorizationInterceptor])),
		provideClientHydration(),
		provideServiceWorker('ngsw-worker.js', {
			enabled: environment.pwa,
			registrationStrategy: 'registerWhenStable:30000'
		}),
		provideRouter(
			APP_ROUTES,
			withPreloading(PreloadAllModules),
			withEnabledBlockingInitialNavigation(),
			withComponentInputBinding(),
			withRouterConfig({
				onSameUrlNavigation: 'reload',
				paramsInheritanceStrategy: 'always'
			})
		),
		importProvidersFrom(provideFirebaseApp(() => initializeApp())),
		importProvidersFrom(provideStorage(() => getStorage())),
		importProvidersFrom(provideFirestore(() => getFirestore())),
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
