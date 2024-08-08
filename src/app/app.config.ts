/** @format */

import { APP_INITIALIZER, ApplicationConfig, NgZone } from '@angular/core';
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
import { httpAuthorizationInterceptor } from './core/interceptors/http.authorization.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http.error.interceptor';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { FirebaseService } from './core/services/firebase.service';
import { PlatformService } from './core/services/platform.service';
import { AppTitleStrategy } from './core/strategies/title.strategy';
import { fetchAndActivate } from 'firebase/remote-config';

export const appConfig: ApplicationConfig = {
	providers: [
		provideHttpClient(withFetch(), withInterceptors([httpAuthorizationInterceptor, httpErrorInterceptor])),
		provideClientHydration(
			withHttpTransferCacheOptions({
				includeRequestsWithAuthHeaders: false,
				includePostRequests: false
			})
		),
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
			useFactory: (platformService: PlatformService, firebaseService: FirebaseService, ngZone: NgZone) => {
				return () => {
					ngZone.runOutsideAngular(() => {
						if (platformService.isBrowser()) {
							firebaseService.initializeApp();
							firebaseService.initializeAppCheck();
							firebaseService.initializeAuth();
							firebaseService.initializeFirestore();
							firebaseService.initializeStorage();
							firebaseService.initializeRemoteConfig();
							firebaseService.initializeAnalytics();

							/** REMOTE CONFIG */

							fetchAndActivate(firebaseService.getRemoteConfig())
								.then((response: boolean) => console.debug('Remote config ' + response))
								.catch((error: any) => console.error(error));
						}
					});
				};
			},
			multi: true,
			deps: [PlatformService, FirebaseService, NgZone]
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
