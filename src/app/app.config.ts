/** @format */

import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
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
import { httpAppCheckInterceptor } from './core/interceptors/http.app-check.interceptor';
import { httpAuthorizationInterceptor } from './core/interceptors/http.authorization.interceptor';
import { provideClientHydration } from '@angular/platform-browser';
import { FirebaseService } from './core/services/firebase.service';
import { PlatformService } from './core/services/platform.service';
import { AppTitleStrategy } from './core/strategies/title.strategy';

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(withFetch(), withInterceptors([httpAppCheckInterceptor, httpAuthorizationInterceptor])),
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
		{
			provide: APP_INITIALIZER,
			useFactory: (platformService: PlatformService, firebaseService: FirebaseService) => {
				return () => {
					if (platformService.isBrowser()) {
						firebaseService.initializeApp();
						firebaseService.initializeAppCheck();
						firebaseService.initializeAuth();
						firebaseService.initializeFirestore();
						firebaseService.initializeStorage();
					}
				};
			},
			multi: true,
			deps: [PlatformService, FirebaseService]
		},
		// TODO: For debug SSR issues
		// {
		// 	provide: APP_INITIALIZER,
		// 	useFactory: (platformService: PlatformService) => {
		// 		return () => {
		// 			return new Promise<void>(resolve => {
		// 				if (platformService.isBrowser()) {
		// 					console.warn('Emulate long initialization - started');
		//
		// 					setTimeout(() => {
		// 						console.warn('Emulate long initialization - completed');
		//
		// 						resolve();
		// 					}, 3000);
		// 				} else {
		// 					resolve();
		// 				}
		// 			});
		// 		};
		// 	},
		// 	multi: true,
		// 	deps: [PlatformService]
		// },
		{
			provide: TitleStrategy,
			useClass: AppTitleStrategy
		}
	]
};
